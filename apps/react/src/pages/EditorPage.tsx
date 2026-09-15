/**
 * Rich text editor — @lexical/react, RFC-001 M5a React equivalent.
 *
 * ToolbarPlugin lives inside LexicalComposer so it can call
 * useLexicalComposerContext. It manages its own toolbar state and exposes
 * markdown + word count upward via callbacks.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type TextFormatType,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
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
} from '@lexical/markdown';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  Bold,
  Check,
  Code,
  Copy,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  TextQuote,
  Undo2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { toast } from '@/lib/toast';

const TRANSFORMERS = [
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

const INITIAL_MARKDOWN = [
  '## Release notes — 4.2',
  '',
  'Billing exports now carry the **tax column** every finance team asked for, and',
  'the reconciliation job retries on a *partial* failure instead of starting over.',
  '',
  '- Tax column in CSV and XLSX exports',
  '- Retry with backoff on partial failures',
  '- `POST /v2/invoices` accepts idempotency keys',
  '',
  '> Upgrading from 4.1 needs no migration. The export columns are additive.',
].join('\n');

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

type BlockKind = 'paragraph' | 'h1' | 'h2' | 'quote' | 'ul' | 'ol';

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  code: boolean;
  strikethrough: boolean;
  block: BlockKind;
  canUndo: boolean;
  canRedo: boolean;
}

function ToolbarPlugin({ onStateChange }: { onStateChange: (state: ToolbarState) => void }) {
  const [editor] = useLexicalComposerContext();
  const stateRef = useRef<ToolbarState>({
    bold: false,
    italic: false,
    code: false,
    strikethrough: false,
    block: 'paragraph',
    canUndo: false,
    canRedo: false,
  });

  const sync = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchor = selection.anchor.getNode();

      let block: BlockKind = 'paragraph';
      const list = $findMatchingParent(anchor, $isListNode);
      if (list) {
        block = list.getListType() === 'number' ? 'ol' : 'ul';
      } else {
        const blockNode = $findMatchingParent(anchor, (n) => $isHeadingNode(n) || $isQuoteNode(n));
        if ($isQuoteNode(blockNode)) {
          block = 'quote';
        } else if ($isHeadingNode(blockNode)) {
          block = blockNode.getTag() === 'h1' ? 'h1' : 'h2';
        }
      }

      const next: ToolbarState = {
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        code: selection.hasFormat('code'),
        strikethrough: selection.hasFormat('strikethrough'),
        block,
        canUndo: stateRef.current.canUndo,
        canRedo: stateRef.current.canRedo,
      };
      stateRef.current = next;
      onStateChange(next);
    });
  }, [editor, onStateChange]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => sync()),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          sync();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (can) => {
          stateRef.current = { ...stateRef.current, canUndo: can };
          onStateChange({ ...stateRef.current });
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (can) => {
          stateRef.current = { ...stateRef.current, canRedo: can };
          onStateChange({ ...stateRef.current });
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, sync, onStateChange]);

  return null;
}

function EditorActions({
  toolbar,
  onFormat,
  onSetBlock,
  onUndo,
  onRedo,
}: {
  toolbar: ToolbarState;
  onFormat: (kind: TextFormatType) => void;
  onSetBlock: (kind: BlockKind) => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const formats: { kind: TextFormatType; icon: React.ReactNode; label: string }[] = [
    { kind: 'bold', icon: <Bold size={16} />, label: 'Bold' },
    { kind: 'italic', icon: <Italic size={16} />, label: 'Italic' },
    { kind: 'strikethrough', icon: <Strikethrough size={16} />, label: 'Strikethrough' },
    { kind: 'code', icon: <Code size={16} />, label: 'Inline code' },
  ];

  const blocks: { kind: BlockKind; icon: React.ReactNode; label: string }[] = [
    { kind: 'h1', icon: <Heading1 size={16} />, label: 'Heading 1' },
    { kind: 'h2', icon: <Heading2 size={16} />, label: 'Heading 2' },
    { kind: 'quote', icon: <TextQuote size={16} />, label: 'Quote' },
    { kind: 'ul', icon: <List size={16} />, label: 'Bulleted list' },
    { kind: 'ol', icon: <ListOrdered size={16} />, label: 'Numbered list' },
  ];

  const btnCls =
    'grid size-8 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary aria-pressed:bg-surface-hover aria-pressed:text-ink-primary';

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="border-hairline flex flex-wrap items-center gap-1 border-b px-3 py-2"
    >
      {formats.map((f) => (
        <button
          key={f.kind}
          type="button"
          title={f.label}
          aria-label={f.label}
          aria-pressed={toolbar[f.kind as keyof typeof toolbar] ? 'true' : 'false'}
          onClick={() => onFormat(f.kind)}
          className={btnCls}
        >
          {f.icon}
        </button>
      ))}

      <span className="bg-hairline mx-1 h-5 w-px" aria-hidden="true" />

      {blocks.map((b) => (
        <button
          key={b.kind}
          type="button"
          title={b.label}
          aria-label={b.label}
          aria-pressed={toolbar.block === b.kind ? 'true' : 'false'}
          onClick={() => onSetBlock(b.kind)}
          className={btnCls}
        >
          {b.icon}
        </button>
      ))}

      <span className="bg-hairline mx-1 h-5 w-px" aria-hidden="true" />

      <button
        type="button"
        title="Undo"
        aria-label="Undo"
        onClick={onUndo}
        disabled={!toolbar.canUndo}
        className={`${btnCls} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        title="Redo"
        aria-label="Redo"
        onClick={onRedo}
        disabled={!toolbar.canRedo}
        className={`${btnCls} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
}

function EditorComposer({
  onMarkdownChange,
  onWordCountChange,
}: {
  onMarkdownChange: (md: string) => void;
  onWordCountChange: (n: number) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [toolbar, setToolbar] = useState<ToolbarState>({
    bold: false,
    italic: false,
    code: false,
    strikethrough: false,
    block: 'paragraph',
    canUndo: false,
    canRedo: false,
  });

  const handleToolbarChange = useCallback((state: ToolbarState) => {
    setToolbar(state);
  }, []);

  const handleFormat = useCallback(
    (kind: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, kind);
    },
    [editor],
  );

  const handleSetBlock = useCallback(
    (kind: BlockKind) => {
      const current = toolbar.block;
      const next = current === kind ? 'paragraph' : kind;

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
        if (current === 'ul' || current === 'ol') {
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
    [editor, toolbar.block],
  );

  const handleUndo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  return (
    <>
      <ToolbarPlugin onStateChange={handleToolbarChange} />
      <EditorActions
        toolbar={toolbar}
        onFormat={handleFormat}
        onSetBlock={handleSetBlock}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <OnChangePlugin
        ignoreSelectionChange
        onChange={(state) => {
          state.read(() => {
            const md = $convertToMarkdownString(TRANSFORMERS);
            const words = $getRoot().getTextContent().split(/\s+/).filter(Boolean).length;
            onMarkdownChange(md);
            onWordCountChange(words);
          });
        }}
      />
    </>
  );
}

export function EditorPage() {
  const [markdown, setMarkdown] = useState('');
  const [words, setWords] = useState(0);
  const [copied, setCopied] = useState(false);

  const initialConfig = {
    namespace: 'clear-admin',
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    theme,
    onError: (error: Error) => {
      throw error;
    },
    editorState: () => {
      $convertFromMarkdownString(INITIAL_MARKDOWN, TRANSFORMERS);
    },
  };

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.show('Markdown copied.', 'success');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DashboardLayout title="Editor" breadcrumb={[{ label: 'Editor' }]}>
      <div className="flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">
            Rich text editor
          </h1>
          <p className="text-caption text-ink-secondary mt-1 max-w-3xl">
            Lexical with React bindings — the toolbar is React state, the document is Lexical, and
            markdown is both the input and the output. Typing{' '}
            <code className="text-micro">## </code> or <code className="text-micro">- </code> at the
            start of a line formats it as you go.
          </p>
        </div>

        <LexicalComposer initialConfig={initialConfig}>
          <div className="rounded-card border-hairline bg-surface-card shadow-card overflow-hidden border">
            <EditorComposer onMarkdownChange={setMarkdown} onWordCountChange={setWords} />

            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="text-body min-h-72 px-5 py-4 focus-visible:outline-none"
                  aria-label="Document body"
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />

            <HistoryPlugin />
            <ListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

            <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5">
              <p className="text-micro text-ink-secondary">
                <span className="tabular">{words}</span> words
              </p>
              <button
                type="button"
                onClick={copyMarkdown}
                className="text-caption text-ink-secondary hover:text-ink-primary inline-flex items-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-success" />
                    <span className="text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy markdown
                  </>
                )}
              </button>
            </div>
          </div>

          <Card
            title="Markdown output"
            description="What the editor would send. It updates on every keystroke, so the round trip is visible rather than promised."
          >
            <pre className="bg-surface-hover text-ink-secondary text-micro rounded-control overflow-x-auto p-4">
              {markdown}
            </pre>
          </Card>
        </LexicalComposer>
      </div>
    </DashboardLayout>
  );
}
