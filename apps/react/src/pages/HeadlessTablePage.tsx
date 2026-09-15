/**
 * The same 48 invoices as DataTablesPage, driven by @tanstack/react-table's
 * faceted models instead of hand-rolled state — RFC-001 D9's React equivalent.
 *
 * Everything here is what the faceted models make materially cheaper: facet
 * counts that update as you filter, column visibility, ordering and pinning.
 * Sorting, search and paging are along for the ride.
 */
import { useState, useCallback, useMemo } from 'react';
import {
  useLegacyTable,
  legacyCreateColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table/legacy';
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnVisibilityState,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Pin } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { invoices } from '@/data/invoices';
import type { Order } from '@/data/dashboard';

const STATUS_TONE = {
  paid: 'success' as const,
  pending: 'warning' as const,
  refunded: 'danger' as const,
};

const money = (v: number) => `$${v.toLocaleString('en-US')}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterOneOf = (row: any, columnId: string, filterValue: string[]) =>
  !filterValue?.length || filterValue.includes(String(row.getValue(columnId)));

const INITIAL_ORDER: ColumnOrderState = ['id', 'customer', 'plan', 'status', 'amount', 'date'];
const PAGE_SIZE = 8;

const colHelper = legacyCreateColumnHelper<Order>();

const COLUMNS = [
  colHelper.accessor('id', { header: 'Invoice', enableSorting: false }),
  colHelper.accessor('customer', { header: 'Customer' }),
  colHelper.accessor('plan', { header: 'Plan', filterFn: filterOneOf, enableColumnFilter: true }),
  colHelper.accessor('status', { header: 'Status', filterFn: filterOneOf, enableColumnFilter: true }),
  colHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => money(info.getValue()),
    sortDescFirst: true,
  }),
  colHelper.accessor('date', { header: 'Date', sortDescFirst: true }),
];

const FACET_COLS = ['plan', 'status'] as const;
const COL_LABELS: Record<string, string> = {
  id: 'Invoice',
  customer: 'Customer',
  plan: 'Plan',
  status: 'Status',
  amount: 'Amount',
  date: 'Date',
};

export function HeadlessTablePage() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(INITIAL_ORDER);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ start: ['id'], end: [] });

  const table = useLegacyTable({
    data: invoices,
    columns: COLUMNS,
    state: { globalFilter, columnFilters, sorting, pagination, columnVisibility, columnOrder, columnPinning },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetPageIndex: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const resetView = useCallback(() => {
    setGlobalFilter('');
    setColumnFilters([]);
    setColumnOrder(INITIAL_ORDER);
    setColumnVisibility({});
    setColumnPinning({ start: ['id'], end: [] });
    setSorting([{ id: 'date', desc: true }]);
    setPagination({ pageIndex: 0, pageSize: PAGE_SIZE });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allCols = (table as any).getAllLeafColumns() as Array<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startCols = (table as any).getStartVisibleLeafColumns() as Array<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const centerCols = (table as any).getCenterVisibleLeafColumns() as Array<any>;
  const visibleCols = useMemo(() => [...startCols, ...centerCols], [startCols, centerCols]);

  const { pageIndex } = pagination;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (table as any).getPageCount?.() ?? 1;
  const total = table.getFilteredRowModel().rows.length;
  const rangeStart = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const rangeEnd = Math.min((pageIndex + 1) * PAGE_SIZE, total);

  const moveCol = useCallback((id: string, delta: number) => {
    setColumnOrder((prev) => {
      const arr = [...prev];
      const from = arr.indexOf(id);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= arr.length) return prev;
      arr.splice(to, 0, ...arr.splice(from, 1));
      return arr;
    });
  }, []);

  const facets = FACET_COLS.map((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const col = (table as any).getColumn(key) as any;
    const selected = (col?.getFilterValue() as string[]) ?? [];
    const values: Array<{ value: string; count: number; checked: boolean }> = col
      ? [...col.getFacetedUniqueValues()].map(([value, count]: [unknown, number]) => ({
          value: String(value),
          count,
          checked: selected.includes(String(value)),
        })).sort((a: { value: string }, b: { value: string }) => a.value.localeCompare(b.value))
      : [];
    return { key, label: COL_LABELS[key] ?? key, values };
  });

  const toggleFacet = useCallback((key: string, value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.find((f) => f.id === key);
      const selected = (existing?.value as string[]) ?? [];
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      const rest = prev.filter((f) => f.id !== key);
      return next.length ? [...rest, { id: key, value: next }] : rest;
    });
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  return (
    <DashboardLayout
      title="Headless table"
      breadcrumb={[{ label: 'Data' }, { label: 'Headless table' }]}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Headless table</h1>
          <p className="text-caption text-ink-secondary mt-1 max-w-3xl">
            The same 48 invoices as the{' '}
            <Link to="/data/tables" className="text-accent font-medium hover:underline">
              data table
            </Link>
            , driven by <code className="text-micro">@tanstack/react-table</code> instead of
            hand-written state. Everything here is something the library makes materially cheaper:
            facet counts that update as you filter, column visibility, ordering and pinning.
          </p>
        </div>

        <div className="rounded-card border-hairline bg-surface-card shadow-card overflow-hidden border">
          {/* Toolbar */}
          <div className="border-hairline flex flex-wrap items-center gap-3 border-b px-4 py-3">
            <div className="relative w-full max-w-xs">
              <svg
                className="text-ink-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                aria-label="Search invoices"
                placeholder="Search invoices"
                className="border-hairline bg-surface-card placeholder:text-ink-secondary w-full rounded-control border py-1.5 pr-3 pl-9 text-caption"
              />
            </div>
            <div className="ml-auto">
              <Button variant="secondary" onClick={resetView}>Reset view</Button>
            </div>
          </div>

          {/* Facets + column controls */}
          <div className="border-hairline flex flex-col gap-3 border-b px-4 py-3">
            {facets.map(({ key, label, values }) => (
              <fieldset key={key} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <legend className="text-micro tracking-label text-ink-secondary font-semibold uppercase">
                  {label}
                </legend>
                {values.map(({ value, count, checked }) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2 text-caption">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacet(key, value)}
                      className="border-hairline bg-surface-card accent-accent size-4 shrink-0 cursor-pointer rounded-[4px] border"
                    />
                    <span>{value}</span>
                    <span className="tabular text-micro text-ink-secondary">({count})</span>
                  </label>
                ))}
              </fieldset>
            ))}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-micro tracking-label text-ink-secondary font-semibold uppercase">
                Columns
              </span>
              {allCols.map((col) => {
                const id = col.id as string;
                const pinned = col.getIsPinned() === 'start';
                const idx = columnOrder.indexOf(id);
                return (
                  <div
                    key={id}
                    className="border-hairline flex items-center gap-1 rounded-control border px-2 py-1"
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-caption">
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={() => col.toggleVisibility()}
                        className="border-hairline bg-surface-card accent-accent size-4 shrink-0 cursor-pointer rounded-[4px] border"
                      />
                      <span>{COL_LABELS[id] ?? id}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => col.pin(pinned ? false : 'start')}
                      aria-pressed={pinned}
                      aria-label={`Pin ${COL_LABELS[id] ?? id}`}
                      className={`grid size-6 place-items-center rounded-control transition-colors hover:bg-surface-hover ${pinned ? 'text-accent' : 'text-ink-secondary'}`}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCol(id, -1)}
                      disabled={idx <= 0}
                      aria-label={`Move ${COL_LABELS[id] ?? id} left`}
                      className="text-ink-secondary grid size-6 place-items-center rounded-control transition-colors hover:bg-surface-hover disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCol(id, 1)}
                      disabled={idx >= columnOrder.length - 1}
                      aria-label={`Move ${COL_LABELS[id] ?? id} right`}
                      className="text-ink-secondary grid size-6 place-items-center rounded-control transition-colors hover:bg-surface-hover disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="text-caption w-full min-w-[48rem] border-collapse">
              <thead>
                <tr className="border-hairline bg-surface-hover/40 border-b">
                  {visibleCols.map((col) => {
                    const id = col.id as string;
                    const pinned = col.getIsPinned() === 'start';
                    const sorted = col.getIsSorted();
                    const canSort = col.getCanSort();
                    return (
                      <th
                        key={id}
                        scope="col"
                        aria-sort={!sorted ? 'none' : sorted === 'asc' ? 'ascending' : 'descending'}
                        className={[
                          'text-ink-secondary px-4 py-2 text-left text-micro font-semibold tracking-label uppercase',
                          pinned && 'sticky left-0 z-10 bg-surface-card',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={col.getToggleSortingHandler()}
                            className="hover:text-ink-primary inline-flex max-w-full items-center gap-1 truncate rounded-control uppercase transition-colors"
                          >
                            {COL_LABELS[id] ?? id}
                            {sorted === 'asc' ? (
                              <ChevronUp size={12} className="shrink-0" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown size={12} className="shrink-0" />
                            ) : (
                              <ChevronsUpDown size={12} className="shrink-0 opacity-40" />
                            )}
                          </button>
                        ) : (
                          <span className="uppercase">{COL_LABELS[id] ?? id}</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const startCells = (row as any).getStartVisibleCells() as Array<any>;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const centerCells = (row as any).getCenterVisibleCells() as Array<any>;
                  return (
                    <tr key={row.id} className="border-hairline border-b last:border-0">
                      {[...startCells, ...centerCells].map((cell) => {
                        const pinned = cell.column.getIsPinned() === 'start';
                        const id = cell.column.id as string;
                        return (
                          <td
                            key={cell.id}
                            className={[
                              'truncate px-4 py-2',
                              pinned && 'sticky left-0 z-10 bg-surface-card font-medium',
                              (id === 'amount' || id === 'date' || id === 'id') && 'tabular',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {id === 'status' ? (
                              <Badge tone={STATUS_TONE[(row.original as Order).status]}>
                                {(row.original as Order).status}
                              </Badge>
                            ) : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {total === 0 && (
            <EmptyState
              title="No invoices match"
              description="Clear a facet or the search to widen the result."
            >
              <button
                type="button"
                onClick={resetView}
                className="text-caption text-accent font-medium hover:underline"
              >
                Reset view
              </button>
            </EmptyState>
          )}

          {/* Pagination */}
          <div className="border-hairline border-t">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-caption text-ink-secondary">
                {total === 0
                  ? 'No results'
                  : `${rangeStart}–${rangeEnd} of ${total}`}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  aria-label="Previous page"
                  disabled={pageIndex === 0}
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="tabular text-caption min-w-12 text-center">
                  {pageIndex + 1} / {Math.max(1, pageCount)}
                </span>
                <Button
                  variant="ghost"
                  aria-label="Next page"
                  disabled={pageIndex >= pageCount - 1}
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card title="Which one to copy" className="max-w-3xl">
          <dl className="text-caption flex flex-col gap-4">
            <div>
              <dt className="font-medium">Take the hand-rolled table</dt>
              <dd className="text-ink-secondary mt-0.5">
                When the screen is rows, a sort, a search and a page — and the endpoint does that
                work. It is the reference implementation and gets every feature first, with no table
                dependency and cell editing already wired.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Take the headless core</dt>
              <dd className="text-ink-secondary mt-0.5">
                When you need the things on this page: facet counts, column visibility, ordering,
                pinning — or grouping and row selection later. It costs a lazy-loaded chunk on pages
                that import it, and state management is handled entirely by the library.
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </DashboardLayout>
  );
}
