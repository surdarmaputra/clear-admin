/**
 * Rich text editor on vanilla Lexical — RFC-001 M5a.
 *
 * Lexical owns the document; Alpine owns the toolbar. The seam between them is
 * `sync()`: one read of the selection after every update, projected into plain
 * booleans the toolbar buttons bind to. Nothing below returns a Lexical object
 * to the template, for the same reason the headless table does not — a node
 * tree is not something to hand a deep-proxying reactivity system.
 *
 * The transformer list is spelled out rather than imported as `TRANSFORMERS`:
 * the full set pulls in `@lexical/code` for fenced blocks this editor has no
 * toolbar for, and an unused dependency is still bytes on the page.
 */
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  createEditor,
  type TextFormatType,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
  registerRichText,
} from '@lexical/rich-text';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
  registerList,
} from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_STAR,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  registerMarkdownShortcuts,
} from '@lexical/markdown';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { component } from './table';

/**
 * Lexical writes these onto the nodes it creates. Tailwind sees them here the
 * same way it sees a class in markup, so they compile like any other utility.
 */
const theme = {
  paragraph: 'mb-3 last:mb-0',
  heading: {
    h1: 'mb-3 font-display text-title font-semibold tracking-display',
    h2: 'mb-2 mt-5 font-display text-title-sm font-semibold tracking-display first:mt-0',
  },
  quote: 'mb-3 border-l-2 border-accent pl-4 text-ink-secondary italic',
  list: {
    ul: 'mb-3 list-disc pl-6',
    ol: 'mb-3 list-decimal pl-6',
    listitem: 'mb-1',
  },
  link: 'text-accent underline',
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    code: 'rounded bg-surface-hover px-1 py-0.5 text-micro',
    strikethrough: 'line-through',
  },
};

/** Markdown shortcuts and the export button share one list — see the note above. */
const transformers = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  LINK,
  BOLD_STAR,
  ITALIC_STAR,
  INLINE_CODE,
  STRIKETHROUGH,
];

export type BlockKind = 'paragraph' | 'h1' | 'h2' | 'quote' | 'ul' | 'ol';

export interface RichEditorConfig {
  /** Seeds the document. Markdown, because that is what the export produces. */
  markdown: string;
}

export function richEditor(config: RichEditorConfig) {
  let editor: ReturnType<typeof createEditor>;
  // Read rather than listened to: `CAN_UNDO_COMMAND` only reports a change, so
  // it is deprecated in favour of state that always holds the current value.
  const history = createEmptyHistoryState();

  return component({
    canUndo: false,
    canRedo: false,
    /** Which inline formats the caret currently sits in. */
    formats: { bold: false, italic: false, code: false, strikethrough: false },
    /** Which block the caret sits in — one of them, never several. */
    block: 'paragraph' as BlockKind,
    words: 0,
    markdown: '',
    copied: false,

    init() {
      editor = createEditor({
        namespace: 'clear-admin',
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
        theme,
        onError: (error: Error) => {
          this.$store.toast.show('The editor hit an error.', 'danger');
          throw error;
        },
      });

      editor.setRootElement(this.$refs.surface as HTMLElement);

      mergeRegister(
        registerRichText(editor),
        registerHistory(editor, history, 300),
        registerList(editor),
        registerMarkdownShortcuts(editor, transformers),
        editor.registerUpdateListener(() => editor.read(() => this.sync())),
        // A click that only moves the caret is not an update, so the toolbar
        // would keep showing the previous block's state without this.
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => (editor.read(() => this.sync()), false),
          COMMAND_PRIORITY_LOW,
        ),
      );

      editor.update(() => $convertFromMarkdownString(config.markdown, transformers));
    },

    /** Runs inside a read: projects the selection into what the toolbar binds to. */
    sync() {
      const selection = $getSelection();
      this.canUndo = history.undoStack.length > 0;
      this.canRedo = history.redoStack.length > 0;
      this.words = $getRoot().getTextContent().split(/\s+/).filter(Boolean).length;
      this.markdown = $convertToMarkdownString(transformers);

      if (!$isRangeSelection(selection)) return;

      this.formats = {
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        code: selection.hasFormat('code'),
        strikethrough: selection.hasFormat('strikethrough'),
      };

      const anchor = selection.anchor.getNode();
      const list = $findMatchingParent(anchor, $isListNode);
      if (list) {
        this.block = list.getListType() === 'number' ? 'ol' : 'ul';
        return;
      }

      const block = $findMatchingParent(
        anchor,
        (node) => $isHeadingNode(node) || $isQuoteNode(node),
      );
      this.block = !block
        ? 'paragraph'
        : $isQuoteNode(block)
          ? 'quote'
          : ($isHeadingNode(block) ? block.getTag() : 'paragraph') === 'h1'
            ? 'h1'
            : 'h2';
    },

    format(kind: TextFormatType) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, kind);
    },

    /** Toggles: pressing the active block's button returns to a paragraph. */
    setBlock(kind: BlockKind) {
      const next = this.block === kind ? 'paragraph' : kind;

      if (kind === 'ul' || kind === 'ol') {
        editor.dispatchCommand(
          next === 'paragraph'
            ? REMOVE_LIST_COMMAND
            : kind === 'ul'
              ? INSERT_UNORDERED_LIST_COMMAND
              : INSERT_ORDERED_LIST_COMMAND,
          undefined,
        );
        return;
      }

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        // A list has to be dismantled before the block underneath can change.
        if (this.block === 'ul' || this.block === 'ol') {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
        $setBlocksType(selection, () =>
          next === 'quote'
            ? $createQuoteNode()
            : next === 'h1' || next === 'h2'
              ? $createHeadingNode(next)
              : $createParagraphNode(),
        );
      });
    },

    undo() {
      editor.dispatchCommand(UNDO_COMMAND, undefined);
    },
    redo() {
      editor.dispatchCommand(REDO_COMMAND, undefined);
    },

    async copyMarkdown() {
      await navigator.clipboard.writeText(this.markdown);
      this.copied = true;
      this.$store.toast.show('Markdown copied.', 'success');
      setTimeout(() => (this.copied = false), 2000);
    },
  });
}
