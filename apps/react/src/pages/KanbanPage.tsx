/**
 * Kanban board — RFC-001 M5c React equivalent.
 *
 * SortableJS handles pointer drag; React state is the only source of truth.
 * On onEnd: the dragged node goes back where it came from, then the card
 * moves in state instead. Without the revert, React and the drag library
 * disagree about the list and the next render drops a card.
 *
 * Keyboard: every card is a tab stop. Arrow left/right changes column, up/down
 * changes position. A board only a mouse can reorder is not a board every user
 * can reorder.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import Sortable from 'sortablejs';
import { GripVertical } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface KanbanCard {
  id: string;
  title: string;
  owner: string;
  tag: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 'c1', title: 'Dunning emails for failed cards', owner: 'Ada L.', tag: 'Billing' },
      { id: 'c2', title: 'Audit log retention policy', owner: 'Grace H.', tag: 'Compliance' },
      { id: 'c3', title: 'Split the invoice export job', owner: 'Alan T.', tag: 'Platform' },
    ],
  },
  {
    id: 'progress',
    title: 'In progress',
    cards: [
      { id: 'c4', title: 'Tax column in CSV export', owner: 'Ada L.', tag: 'Billing' },
      { id: 'c5', title: 'Retry partial reconciliations', owner: 'Katherine J.', tag: 'Platform' },
    ],
  },
  {
    id: 'review',
    title: 'In review',
    cards: [
      { id: 'c6', title: 'Idempotency keys on POST /v2/invoices', owner: 'Alan T.', tag: 'API' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 'c7', title: 'Seat count webhook', owner: 'Grace H.', tag: 'API' },
      { id: 'c8', title: 'Remove the legacy price table', owner: 'Katherine J.', tag: 'Platform' },
    ],
  },
];

export function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [announcement, setAnnouncement] = useState('');
  const [focusId, setFocusId] = useState<string | null>(null);

  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const listRefs = useRef<Map<string, HTMLUListElement>>(new Map());
  const cardRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const announce = useCallback((card: KanbanCard, col: KanbanColumn, position?: number) => {
    setAnnouncement(
      position
        ? `${card.title} moved to position ${position} in ${col.title}.`
        : `${card.title} moved to ${col.title}.`,
    );
  }, []);

  const handleDragEnd = useCallback(
    (event: Sortable.SortableEvent) => {
      const { from, to, item, oldIndex, newIndex } = event;
      if (oldIndex === undefined || newIndex === undefined) return;

      // Revert DOM — React owns the list, not SortableJS.
      from.insertBefore(item, from.children[oldIndex] ?? null);

      const current = columnsRef.current;
      const srcCol = current.find((c) => c.id === from.dataset.column);
      const tgtCol = current.find((c) => c.id === to.dataset.column);
      if (!srcCol || !tgtCol) return;

      const next = current.map((c) => ({ ...c, cards: [...c.cards] }));
      const src = next.find((c) => c.id === srcCol.id)!;
      const tgt = next.find((c) => c.id === tgtCol.id)!;
      const card = src.cards[oldIndex];
      if (!card) return;
      src.cards.splice(oldIndex, 1);
      tgt.cards.splice(newIndex, 0, card);

      setColumns(next);
      announce(card, tgt);
    },
    [announce],
  );

  // Bind Sortable once after mount; handleDragEnd reads columnsRef so no re-bind needed.
  useEffect(() => {
    const sortables: Sortable[] = [];
    for (const [, el] of listRefs.current) {
      sortables.push(
        Sortable.create(el, {
          group: 'kanban',
          animation: 150,
          draggable: '[data-card]',
          ghostClass: 'opacity-40',
          onEnd: handleDragEnd,
        }),
      );
    }
    return () => sortables.forEach((s) => s.destroy());
  }, []);

  // Focus the card that was just moved via keyboard.
  useEffect(() => {
    if (!focusId) return;
    cardRefs.current.get(focusId)?.focus();
    setFocusId(null);
  }, [focusId, columns]);

  const locate = useCallback(
    (id: string) => {
      const colIdx = columns.findIndex((c) => c.cards.some((card) => card.id === id));
      if (colIdx === -1) return null;
      const cardIdx = columns[colIdx]!.cards.findIndex((c) => c.id === id);
      return { colIdx, cardIdx };
    },
    [columns],
  );

  const moveTo = useCallback(
    (id: string, delta: number) => {
      const at = locate(id);
      if (!at) return;
      const { colIdx, cardIdx } = at;
      const toColIdx = colIdx + delta;
      if (toColIdx < 0 || toColIdx >= columns.length) return;

      const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
      const srcCards = next[colIdx]!.cards;
      const card = srcCards[cardIdx];
      if (!card) return;
      srcCards.splice(cardIdx, 1);
      const tgt = next[toColIdx]!;
      tgt.cards.splice(Math.min(cardIdx, tgt.cards.length), 0, card);

      setColumns(next);
      announce(card, tgt);
      setFocusId(id);
    },
    [columns, locate, announce],
  );

  const reorder = useCallback(
    (id: string, delta: number) => {
      const at = locate(id);
      if (!at) return;
      const { colIdx, cardIdx } = at;
      const toIdx = cardIdx + delta;
      if (toIdx < 0 || toIdx >= columns[colIdx]!.cards.length) return;

      const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
      const col = next[colIdx]!;
      const card = col.cards[cardIdx];
      if (!card) return;
      col.cards.splice(cardIdx, 1);
      col.cards.splice(toIdx, 0, card);

      setColumns(next);
      announce(card, col, toIdx + 1);
      setFocusId(id);
    },
    [columns, locate, announce],
  );

  return (
    <DashboardLayout title="Kanban" breadcrumb={[{ label: 'Data' }, { label: 'Kanban' }]}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Kanban</h1>
          <p id="kanban-help" className="text-caption text-ink-secondary mt-1 max-w-3xl">
            Drag a card with the pointer, or focus one and move it with the arrow keys — left and
            right change column, up and down change position. SortableJS handles the drag; the
            board&apos;s state is the only thing either path writes to.
          </p>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <section
              key={col.id}
              className="rounded-card border-hairline bg-surface-card shadow-card flex flex-col border"
            >
              <header className="border-hairline flex items-center justify-between gap-2 border-b px-4 py-3">
                <h2 className="text-caption font-semibold">{col.title}</h2>
                <span className="tabular bg-surface-hover text-ink-secondary rounded-full px-2 py-0.5 text-micro">
                  {col.cards.length}
                </span>
              </header>

              <ul
                ref={(el) => {
                  if (el) listRefs.current.set(col.id, el);
                  else listRefs.current.delete(col.id);
                }}
                data-column={col.id}
                aria-label={`${col.title} cards`}
                className="flex min-h-24 flex-1 flex-col gap-2 p-3"
              >
                {col.cards.map((card) => (
                  <li
                    key={card.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(card.id, el);
                      else cardRefs.current.delete(card.id);
                    }}
                    data-card={card.id}
                    tabIndex={0}
                    aria-describedby="kanban-help"
                    aria-label={`${card.title}, ${col.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo(card.id, -1); }
                      if (e.key === 'ArrowRight') { e.preventDefault(); moveTo(card.id, 1); }
                      if (e.key === 'ArrowUp') { e.preventDefault(); reorder(card.id, -1); }
                      if (e.key === 'ArrowDown') { e.preventDefault(); reorder(card.id, 1); }
                    }}
                    className="border-hairline bg-surface-page hover:bg-surface-hover cursor-grab rounded-control border p-3 transition-colors active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-ink-secondary mt-0.5 shrink-0" aria-hidden>
                        <GripVertical size={16} />
                      </span>
                      <p className="text-caption min-w-0 flex-1 font-medium">{card.title}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 pl-6">
                      <span className="text-ink-secondary truncate text-micro">{card.owner}</span>
                      <span className="bg-surface-hover text-ink-secondary shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-medium">
                        {card.tag}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
