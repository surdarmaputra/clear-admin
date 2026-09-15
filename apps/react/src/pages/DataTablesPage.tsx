import { useState, useRef, useCallback, useMemo } from 'react';
import {
  useLegacyTable,
  legacyCreateColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table/legacy';
import { flexRender } from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { invoices as initialInvoices } from '@/data/invoices';
import type { Order } from '@/data/dashboard';

const statusTone = {
  paid: 'success' as const,
  pending: 'warning' as const,
  refunded: 'danger' as const,
};

const PAGE_SIZE = 8;

type EditState = { rowId: string; field: 'customer' | 'amount' | 'date'; value: string };

const colHelper = legacyCreateColumnHelper<Order>();

const COL_IDS = ['id', 'customer', 'plan', 'status', 'amount', 'date'] as const;

export function DataTablesPage() {
  const [data, setData] = useState<Order[]>(() => [...initialInvoices]);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: 'date', desc: true },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [globalFilter, setGlobalFilter] = useState('');
  const [failing, setFailing] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    id: 120,
    customer: 200,
    plan: 120,
    status: 110,
    amount: 120,
    date: 130,
  });

  const resizeRef = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);
  const colWidthsRef = useRef(colWidths);
  colWidthsRef.current = colWidths;

  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) return data;
    const q = globalFilter.toLowerCase();
    return data.filter(
      (row) =>
        row.id.toLowerCase().includes(q) ||
        row.customer.toLowerCase().includes(q) ||
        row.plan.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [data, globalFilter]);

  // Reset to page 0 when filter changes (synchronous derived state update)
  const prevFilter = useRef(globalFilter);
  if (prevFilter.current !== globalFilter) {
    prevFilter.current = globalFilter;
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }

  const commitEdit = useCallback(() => {
    if (!editing) return;
    const { rowId, field, value } = editing;
    setData((rows) =>
      rows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === 'amount') {
          const num = parseFloat(value.replace(/[^0-9.]/g, ''));
          return { ...row, amount: isNaN(num) ? row.amount : Math.round(num) };
        }
        return { ...row, [field]: value };
      }),
    );
    setEditing(null);
  }, [editing]);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const startEdit = useCallback((rowId: string, field: EditState['field'], value: string) => {
    setEditing({ rowId, field, value });
  }, []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    },
    [commitEdit, cancelEdit],
  );

  const startResize = useCallback((colId: string, e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = {
      colId,
      startX: e.clientX,
      startWidth: colWidthsRef.current[colId] ?? 120,
    };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const newWidth = Math.max(80, resizeRef.current.startWidth + ev.clientX - resizeRef.current.startX);
      setColWidths((w) => ({ ...w, [resizeRef.current!.colId]: newWidth }));
    };
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const columns = useMemo(
    () => [
      colHelper.accessor('id', {
        header: 'Invoice',
        enableSorting: false,
        cell: (ctx) => <span className="tabular font-medium">{ctx.getValue()}</span>,
      }),
      colHelper.accessor('customer', {
        header: 'Customer',
        cell: (ctx) => {
          const rowId = ctx.row.original.id;
          if (editing?.rowId === rowId && editing.field === 'customer') {
            return (
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className="w-full bg-transparent outline-none"
                value={editing.value}
                onChange={(e) => setEditing((s) => s && { ...s, value: e.target.value })}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            );
          }
          return (
            <button
              className="w-full text-left hover:underline"
              onClick={() => startEdit(rowId, 'customer', ctx.getValue())}
            >
              {ctx.getValue()}
            </button>
          );
        },
      }),
      colHelper.accessor('plan', {
        header: 'Plan',
        cell: (ctx) => <span className="text-ink-secondary">{ctx.getValue()}</span>,
      }),
      colHelper.accessor('status', {
        header: 'Status',
        enableSorting: false,
        cell: (ctx) => <Badge tone={statusTone[ctx.getValue()]}>{ctx.getValue()}</Badge>,
      }),
      colHelper.accessor('amount', {
        header: 'Amount',
        cell: (ctx) => {
          const rowId = ctx.row.original.id;
          if (editing?.rowId === rowId && editing.field === 'amount') {
            return (
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className="tabular w-full bg-transparent text-right outline-none"
                value={editing.value}
                onChange={(e) => setEditing((s) => s && { ...s, value: e.target.value })}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            );
          }
          return (
            <button
              className="tabular w-full text-right hover:underline"
              onClick={() => startEdit(rowId, 'amount', String(ctx.getValue()))}
            >
              ${ctx.getValue().toLocaleString('en-US')}
            </button>
          );
        },
      }),
      colHelper.accessor('date', {
        header: 'Date',
        cell: (ctx) => {
          const rowId = ctx.row.original.id;
          if (editing?.rowId === rowId && editing.field === 'date') {
            return (
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className="tabular w-full bg-transparent text-right outline-none"
                value={editing.value}
                onChange={(e) => setEditing((s) => s && { ...s, value: e.target.value })}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            );
          }
          return (
            <button
              className="tabular text-ink-secondary w-full text-right hover:underline"
              onClick={() => startEdit(rowId, 'date', ctx.getValue())}
            >
              {ctx.getValue()}
            </button>
          );
        },
      }),
    ],
    [editing, startEdit, commitEdit, handleEditKeyDown],
  );

  const table = useLegacyTable({
    data: filteredData,
    columns: columns as any,
    state: { sorting, pagination } as any,
    onSortingChange: setSorting as any,
    onPaginationChange: setPagination as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const state = table.getState();
  const { pageIndex } = state.pagination as { pageIndex: number };
  const pageCount = (table as any).getPageCount?.() ?? Math.ceil(filteredData.length / PAGE_SIZE);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;
  const sortCol = sorting[0];

  return (
    <DashboardLayout title="Tables" breadcrumb={[{ label: 'Data' }, { label: 'Tables' }]}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Data table</h1>
          <p className="mt-1 max-w-3xl text-caption text-ink-secondary">
            48 invoices behind a paged endpoint. Sorting, searching and paging are the server's
            job — the table holds one page at a time. Drag a column edge to resize it. Customer,
            amount and date edit in place: click to edit, Enter confirms, Escape cancels.
          </p>
        </div>

        <div className="rounded-card border-hairline bg-surface-card shadow-card overflow-hidden border">
          {/* Toolbar */}
          <div className="border-hairline flex flex-wrap items-end gap-3 border-b p-4">
            <div className="min-w-0 flex-1">
              <Input
                id="table-search"
                label="Search invoices"
                placeholder="Invoice, customer, plan…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Button variant="secondary" onClick={() => setFailing((f) => !f)}>
              {failing ? 'Fix the endpoint' : 'Break the endpoint'}
            </Button>
          </div>

          {failing ? (
            <ErrorState
              title="Could not load invoices"
              description="The request failed. Nothing was lost — try again."
            >
              <Button variant="secondary" onClick={() => setFailing(false)}>
                Try again
              </Button>
            </ErrorState>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-caption w-full" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  {COL_IDS.map((id) => (
                    <col key={id} style={{ width: colWidths[id] }} />
                  ))}
                </colgroup>
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-hairline bg-surface-sidebar border-b">
                      {hg.headers.map((header) => {
                        const colId = header.column.id;
                        const sorted = header.column.getIsSorted();
                        const canSort = header.column.getCanSort();
                        return (
                          <th
                            key={header.id}
                            className="text-ink-secondary relative px-4 py-2 text-left font-medium"
                          >
                            <div className="flex items-center gap-1 overflow-hidden">
                              {canSort ? (
                                <button
                                  className="hover:text-ink-primary flex min-w-0 items-center gap-1 truncate transition-colors"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <span className="truncate">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                                  </span>
                                  {sorted === 'asc' ? (
                                    <ChevronUp size={12} className="shrink-0" />
                                  ) : sorted === 'desc' ? (
                                    <ChevronDown size={12} className="shrink-0" />
                                  ) : (
                                    <ChevronsUpDown size={12} className="shrink-0 opacity-40" />
                                  )}
                                </button>
                              ) : (
                                <span className="truncate">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                              )}
                            </div>
                            {/* Resize divider */}
                            <div
                              role="separator"
                              aria-hidden
                              onMouseDown={(e) => startResize(colId, e)}
                              className="bg-accent/60 hover:bg-accent absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity hover:opacity-100"
                            />
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          title="No invoices match"
                          description="The endpoint returned nothing for that search."
                        >
                          <button
                            type="button"
                            onClick={() => setGlobalFilter('')}
                            className="text-caption font-medium text-accent hover:underline"
                          >
                            Clear search
                          </button>
                        </EmptyState>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-hairline hover:bg-surface-hover border-b last:border-0"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="truncate px-4 py-2">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!failing && (
            <div className="border-hairline border-t">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <p className="text-caption text-ink-secondary">
                  {filteredData.length === 0
                    ? 'No results'
                    : `${pageIndex * PAGE_SIZE + 1}–${Math.min((pageIndex + 1) * PAGE_SIZE, filteredData.length)} of ${filteredData.length}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    aria-label="Previous page"
                    disabled={!canPrev}
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
                    disabled={!canNext}
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              <div className="border-hairline border-t px-4 py-3">
                <p className="text-micro tracking-label text-ink-secondary uppercase">
                  Next request
                </p>
                <pre className="tabular mt-1 overflow-x-auto text-micro text-ink-secondary">
                  {`GET /api/invoices?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}&sort=${sortCol?.id ?? ''}&dir=${sortCol?.desc ? 'desc' : 'asc'}&q=${encodeURIComponent(globalFilter)}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
