/**
 * Kanban board on SortableJS — RFC-001 M5c.
 *
 * Alpine renders the columns; SortableJS handles the pointer drag. They both
 * want to own the DOM, so the deal is: SortableJS never keeps its move. On
 * `onEnd` the dragged node goes back where it came from and the card moves in
 * `columns` instead, which is the only state either side reads. Without the
 * revert, Alpine's `x-for` and the drag library disagree about what is in the
 * list and the next render drops a card.
 *
 * Dragging is the second way to move a card, not the first — every card is a
 * tab stop and moves with the arrow keys. A board only a mouse can reorder is
 * not a board every user can reorder.
 */
import Sortable from 'sortablejs';
import { component } from './table';

export interface KanbanCard {
  id: string;
  title: string;
  owner: string;
  tag: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanConfig {
  columns: KanbanColumn[];
}

export function kanbanBoard(config: KanbanConfig) {
  return component({
    columns: config.columns,
    /** Read by the live region, so a keyboard move is announced, not just drawn. */
    announcement: '',
    /**
     * The card a keyboard move should leave focused. A moved card is a new
     * element in a different list, and Alpine may re-render it more than once,
     * so the card claims the focus itself as it renders rather than the move
     * chasing a node that no longer exists.
     */
    focusId: null as string | null,

    init() {
      // The lists live inside `x-for`, so they do not exist yet on init — a
      // bind here would silently attach to nothing and leave the board
      // keyboard-only.
      this.$nextTick(() => this.bind());
    },

    bind() {
      for (const list of this.$el.querySelectorAll<HTMLElement>('[data-kanban-list]')) {
        Sortable.create(list, {
          group: 'kanban',
          animation: 150,
          draggable: '[data-card]',
          ghostClass: 'opacity-40',
          onEnd: (event) => this.onEnd(event),
        });
      }
    },

    onEnd(event: Sortable.SortableEvent) {
      const { from, to, item, oldIndex, newIndex } = event;
      if (oldIndex === undefined || newIndex === undefined) return;

      // Hand the node back before Alpine notices it moved (see the file note).
      from.insertBefore(item, from.children[oldIndex] ?? null);

      const source = this.column(from.dataset.column);
      const target = this.column(to.dataset.column);
      if (!source || !target) return;

      const [card] = source.cards.splice(oldIndex, 1);
      target.cards.splice(newIndex, 0, card);
      this.announce(card, target);
    },

    column(id: string | undefined) {
      return this.columns.find((candidate) => candidate.id === id);
    },

    /** Column of a card, plus where it sits — the one lookup every move needs. */
    locate(id: string) {
      const column = this.columns.find((candidate) =>
        candidate.cards.some((card) => card.id === id),
      );
      return column ? { column, index: column.cards.findIndex((card) => card.id === id) } : null;
    },

    /** Left/right across columns; the card keeps its place in the list. */
    moveTo(id: string, delta: number) {
      const at = this.locate(id);
      if (!at) return;

      const to = this.columns.indexOf(at.column) + delta;
      if (to < 0 || to >= this.columns.length) return;

      const target = this.columns[to];
      const [card] = at.column.cards.splice(at.index, 1);
      target.cards.splice(Math.min(at.index, target.cards.length), 0, card);
      this.announce(card, target);
      this.focusId = id;
    },

    /** Up/down within a column. */
    reorder(id: string, delta: number) {
      const at = this.locate(id);
      if (!at) return;

      const to = at.index + delta;
      if (to < 0 || to >= at.column.cards.length) return;

      const [card] = at.column.cards.splice(at.index, 1);
      at.column.cards.splice(to, 0, card);
      this.announce(card, at.column, to + 1);
      this.focusId = id;
    },

    announce(card: KanbanCard, column: KanbanColumn, position?: number) {
      this.announcement = position
        ? `${card.title} moved to position ${position} in ${column.title}.`
        : `${card.title} moved to ${column.title}.`;
    },
  });
}
