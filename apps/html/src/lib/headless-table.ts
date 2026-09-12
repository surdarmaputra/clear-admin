/**
 * The same invoice screen as `serverTable`, driven by `@tanstack/table-core`
 * instead of hand-rolled state — RFC-001 D9's second implementation.
 *
 * The core owns every piece of table state in its own atoms, so the whole
 * Alpine adapter is the `store.subscribe` in `init`: it bumps a counter that
 * the getters below read, and Alpine re-evaluates them. Nothing else here is
 * state management — the rest is projection, turning table objects into the
 * plain data the template renders.
 *
 * Everything on this page is a feature the core makes materially cheaper than
 * writing it by hand: faceted filters with live counts, column visibility,
 * ordering and pinning. Sorting, search and paging exist because a table
 * without them is not the same screen — not because the core is needed for
 * them. See D9's rule before adding anything else.
 */
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  constructTable,
  createCoreRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/table-core';
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings';
import { component, type Row } from './table';

/** Multi-select over a scalar cell — every built-in filter wants an array one. */
const filterFn_oneOf = (
  row: { getValue: (id: string) => unknown },
  columnId: string,
  filterValue: string[],
) => !filterValue?.length || filterValue.includes(String(row.getValue(columnId)));

const features = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  coreRowModel: createCoreRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString, oneOf: filterFn_oneOf },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

export interface HeadlessColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  /** `badge` and `money` pick the cell renderer; anything else prints as text. */
  format?: 'money' | 'badge';
  /** Tabular figures, for a column whose values must line up vertically. */
  tabular?: boolean;
  /** Adds this column to the facet panel, with counts from the core. */
  facet?: boolean;
}

export interface HeadlessTableConfig {
  columns: HeadlessColumn[];
  rows: Row[];
  sort: string;
  pageSize?: number;
  /** Column keys pinned to the start on first load. */
  pinned?: string[];
}

/** What the template renders. Plain objects only — no table internals leak out. */
interface ViewColumn {
  key: string;
  label: string;
  align: 'left' | 'right';
  sorted: false | 'asc' | 'desc';
  ariaSort: 'none' | 'ascending' | 'descending';
  pinned: boolean;
}

interface ViewCell {
  key: string;
  text: string;
  align: 'left' | 'right';
  format: HeadlessColumn['format'] | 'text';
  tabular: boolean;
  pinned: boolean;
}

const money = (value: unknown) => `$${Number(value).toLocaleString('en-US')}`;

export function headlessTable(config: HeadlessTableConfig) {
  const meta = new Map(config.columns.map((column) => [column.key, column]));
  const order = config.columns.map((column) => column.key);

  const build = () =>
    constructTable({
      features,
      data: config.rows,
      columns: config.columns.map((column) => ({
        id: column.key,
        accessorKey: column.key,
        header: column.label,
        enableColumnFilter: Boolean(column.facet),
        filterFn: 'oneOf' as const,
      })),
      globalFilterFn: 'includesString' as const,
      initialState: {
        columnOrder: order,
        columnPinning: { start: config.pinned ?? [], end: [] },
        pagination: { pageIndex: 0, pageSize: config.pageSize ?? 8 },
        sorting: [{ id: config.sort, desc: true }],
      },
    });

  // Outside the returned object on purpose: Alpine deep-proxies its own data,
  // and a table instance is not something to hand a reactivity system.
  let table: ReturnType<typeof build>;

  const text = (key: string, value: unknown) =>
    meta.get(key)?.format === 'money' ? money(value) : String(value);

  return component({
    /** Bumped by the core's store; every getter below reads it so Alpine reruns. */
    tick: 0,
    q: '',

    init() {
      table = build();
      table.store.subscribe(() => this.tick++);
      this.$watch('q', () => table.setGlobalFilter(this.q));
    },

    /** Pinned columns first, so the DOM order matches what the eye expects. */
    get columns(): ViewColumn[] {
      void this.tick;
      return [...table.getStartVisibleLeafColumns(), ...table.getCenterVisibleLeafColumns()].map(
        (column) => {
          const sorted = column.getIsSorted();
          return {
            key: column.id,
            label: meta.get(column.id)?.label ?? column.id,
            align: meta.get(column.id)?.align ?? 'left',
            sorted,
            ariaSort: !sorted ? 'none' : sorted === 'asc' ? 'ascending' : 'descending',
            pinned: column.getIsPinned() === 'start',
          };
        },
      );
    },

    get rows() {
      void this.tick;
      return table.getRowModel().rows.map((row) => ({
        id: row.id,
        cells: [...row.getStartVisibleCells(), ...row.getCenterVisibleCells()].map(
          (cell): ViewCell => ({
            key: cell.column.id,
            text: text(cell.column.id, cell.getValue()),
            align: meta.get(cell.column.id)?.align ?? 'left',
            format: meta.get(cell.column.id)?.format ?? 'text',
            tabular: Boolean(meta.get(cell.column.id)?.tabular),
            pinned: cell.column.getIsPinned() === 'start',
          }),
        ),
      }));
    },

    /** Every column, in order, for the visibility menu. */
    get allColumns() {
      void this.tick;
      return table.getAllLeafColumns().map((column) => ({
        key: column.id,
        label: meta.get(column.id)?.label ?? column.id,
        visible: column.getIsVisible(),
        pinned: column.getIsPinned() === 'start',
      }));
    },

    /** The facet panel: distinct values with the count each would return. */
    get facets() {
      void this.tick;
      return config.columns
        .filter((column) => column.facet)
        .map((column) => {
          const selected = (table.getColumn(column.key)?.getFilterValue() as string[]) ?? [];
          return {
            key: column.key,
            label: column.label,
            values: [...(table.getColumn(column.key)?.getFacetedUniqueValues() ?? [])]
              .map(([value, count]) => ({
                value: String(value),
                count,
                checked: selected.includes(String(value)),
              }))
              .sort((a, b) => a.value.localeCompare(b.value)),
          };
        });
    },

    toggleFacet(key: string, value: string) {
      const column = table.getColumn(key);
      if (!column) return;
      const selected = (column.getFilterValue() as string[]) ?? [];
      const next = selected.includes(value)
        ? selected.filter((candidate) => candidate !== value)
        : [...selected, value];
      column.setFilterValue(next.length ? next : undefined);
      table.setPageIndex(0);
    },

    toggleVisible(key: string) {
      table.getColumn(key)?.toggleVisibility();
    },
    togglePin(key: string) {
      const column = table.getColumn(key);
      column?.pin(column.getIsPinned() === 'start' ? false : 'start');
    },
    /** Moves a column one place through `columnOrder`; the core re-renders from it. */
    move(key: string, delta: number) {
      void this.tick;
      const current = [...(table.store.state.columnOrder ?? order)];
      const from = current.indexOf(key);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= current.length) return;
      current.splice(to, 0, ...current.splice(from, 1));
      table.setColumnOrder(current);
    },
    canMove(key: string, delta: number) {
      void this.tick;
      const current = table.store.state.columnOrder ?? order;
      const to = current.indexOf(key) + delta;
      return to >= 0 && to < current.length;
    },

    sortBy(key: string) {
      table.getColumn(key)?.toggleSorting();
      table.setPageIndex(0);
    },

    get total() {
      void this.tick;
      return table.getFilteredRowModel().rows.length;
    },
    get page() {
      void this.tick;
      return table.store.state.pagination.pageIndex + 1;
    },
    get pageCount() {
      void this.tick;
      return Math.max(1, table.getPageCount());
    },
    get pageSize() {
      void this.tick;
      return table.store.state.pagination.pageSize;
    },
    get rangeStart() {
      return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    },
    get rangeEnd() {
      return Math.min(this.page * this.pageSize, this.total);
    },
    prev() {
      table.previousPage();
    },
    next() {
      table.nextPage();
    },

    /** Back to the state the page loaded in, search included. */
    reset() {
      this.q = '';
      table.resetColumnFilters();
      table.resetColumnOrder();
      table.resetColumnVisibility();
      table.resetColumnPinning();
      table.resetSorting();
      table.setPageIndex(0);
    },
  });
}
