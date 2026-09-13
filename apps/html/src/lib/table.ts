/**
 * Server-side table state: the rows on screen are one page fetched from
 * somewhere else, and sorting, filtering and paging are that endpoint's job.
 *
 * `url` points at a real endpoint. Without one the table runs against
 * `mockEndpoint`, which does the same work in memory behind a latency so the
 * loading and error states are visible in the demo — that is the seam to
 * replace, and nothing above it changes when you do.
 */

export type Row = Record<string, string | number>;

/** The Alpine magics these methods reach for. Kept here so `this` is typed. */
interface Magics {
  $el: HTMLElement;
  $refs: Record<string, HTMLElement>;
  $store: {
    toast: { show(message: string, variant?: string): void };
    overlay: { is(id: string): boolean; open(id: string): void; close(): void };
  };
  $nextTick(callback: () => void): void;
  $watch(property: string, callback: () => void): void;
}

/** Types `this` inside the returned object without naming its shape twice. */
export const component = <T>(data: T & ThisType<T & Magics>): T => data;

export interface PageRequest {
  page: number;
  pageSize: number;
  sort: string;
  dir: 'asc' | 'desc';
  q: string;
}

export interface PageResponse {
  rows: Row[];
  total: number;
}

export interface ServerTableConfig {
  /** Column keys, in render order. Drives resizing and cell navigation. */
  columns: string[];
  sort: string;
  dir?: 'asc' | 'desc';
  pageSize?: number;
  /** Real endpoint. Receives page, pageSize, sort, dir and q as query params. */
  url?: string;
  /** In-memory dataset for the mock endpoint. Ignored when `url` is set. */
  rows?: Row[];
  searchKeys?: string[];
  idKey?: string;
  /** Mock round-trip, in ms. */
  latency?: number;
  /** Columns a user may edit in place. */
  editable?: string[];
  /** localStorage key for column widths. Widths are not persisted without one. */
  storageKey?: string;
}

const compare = (a: Row[string], b: Row[string]) =>
  typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));

/** Stands in for the endpoint: same contract, same latency, no server. */
export const mockEndpoint =
  (rows: Row[], searchKeys: string[], latency: number) =>
  (request: PageRequest): Promise<PageResponse> => {
    const q = request.q.trim().toLowerCase();
    const matched = q
      ? rows.filter((row) => searchKeys.some((key) => String(row[key]).toLowerCase().includes(q)))
      : rows;

    const direction = request.dir === 'asc' ? 1 : -1;
    const sorted = [...matched].sort(
      (a, b) => compare(a[request.sort], b[request.sort]) * direction,
    );

    const start = (request.page - 1) * request.pageSize;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({ rows: sorted.slice(start, start + request.pageSize), total: matched.length }),
        latency,
      ),
    );
  };

/** Stands in for PATCH /invoices/:id. A real one replaces this with fetch. */
const save = (latency: number) => new Promise((resolve) => setTimeout(resolve, latency));

const fetchEndpoint =
  (url: string) =>
  async (request: PageRequest): Promise<PageResponse> => {
    const query = new URLSearchParams({
      page: String(request.page),
      pageSize: String(request.pageSize),
      sort: request.sort,
      dir: request.dir,
      q: request.q,
    });
    const response = await fetch(`${url}?${query}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  };

export function serverTable(config: ServerTableConfig) {
  // `$el` is whichever element the expression ran on — a cell button, an input —
  // not the component root, so the root is captured once at init instead.
  let root: HTMLElement;
  const idKey = config.idKey ?? 'id';
  const editable = config.editable ?? [];
  const endpoint = config.url
    ? fetchEndpoint(config.url)
    : mockEndpoint(config.rows ?? [], config.searchKeys ?? [], config.latency ?? 400);

  return component({
    rows: [] as Row[],
    total: 0,
    page: 1,
    pageSize: config.pageSize ?? 8,
    sort: config.sort,
    dir: config.dir ?? 'desc',
    q: '',
    status: 'loading' as 'loading' | 'ready' | 'error',
    error: '',
    /** Demo switch: makes the mock endpoint reject, so the error state is reachable. */
    failing: false,

    widths: {} as Record<string, number>,
    editing: '' as string,
    draft: '' as string,
    saving: false,

    // Responses can land out of order once a fast search follows a slow sort.
    // Only the newest request is allowed to write to the table.
    latest: 0,
    debounce: undefined as ReturnType<typeof setTimeout> | undefined,

    init() {
      root = this.$el;
      this.restoreWidths();
      this.load();
      this.$watch('q', () => {
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          this.page = 1;
          this.load();
        }, 300);
      });
    },

    async load() {
      const request = ++this.latest;
      this.status = 'loading';

      try {
        if (this.failing) throw new Error('The orders service did not respond.');
        const { rows, total } = await endpoint({
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sort,
          dir: this.dir,
          q: this.q,
        });
        if (request !== this.latest) return;
        this.rows = rows;
        this.total = total;
        this.status = 'ready';
      } catch (error) {
        if (request !== this.latest) return;
        this.error = error instanceof Error ? error.message : String(error);
        this.status = 'error';
      }
    },

    get pageCount() {
      return Math.max(1, Math.ceil(this.total / this.pageSize));
    },
    get rangeStart() {
      return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    },
    get rangeEnd() {
      return Math.min(this.page * this.pageSize, this.total);
    },

    sortBy(key: string) {
      if (this.sort === key) {
        this.dir = this.dir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort = key;
        this.dir = 'asc';
      }
      this.page = 1;
      this.load();
    },
    ariaSort(key: string) {
      if (this.sort !== key) return 'none';
      return this.dir === 'asc' ? 'ascending' : 'descending';
    },
    prev() {
      if (this.page > 1) {
        this.page--;
        this.load();
      }
    },
    next() {
      if (this.page < this.pageCount) {
        this.page++;
        this.load();
      }
    },
    retry() {
      this.failing = false;
      this.load();
    },

    // --- column widths -----------------------------------------------------

    restoreWidths() {
      if (!config.storageKey) return;
      try {
        this.widths = JSON.parse(localStorage.getItem(config.storageKey) ?? '{}');
      } catch {
        this.widths = {};
      }
    },
    storeWidths() {
      if (!config.storageKey) return;
      localStorage.setItem(config.storageKey, JSON.stringify(this.widths));
    },
    width(key: string) {
      return this.widths[key] ? `${this.widths[key]}px` : 'auto';
    },
    /** Below 72px a header label has nowhere to go. */
    resize(key: string, to: number) {
      this.widths[key] = Math.max(72, Math.round(to));
      this.storeWidths();
    },
    startResize(event: PointerEvent, key: string) {
      const header = (event.target as HTMLElement).closest('th');
      if (!header) return;

      const startX = event.clientX;
      const startWidth = header.getBoundingClientRect().width;
      const move = (moved: PointerEvent) => this.resize(key, startWidth + moved.clientX - startX);
      const stop = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
      };

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop);
    },
    nudge(event: KeyboardEvent, key: string) {
      const step = event.key === 'ArrowLeft' ? -16 : event.key === 'ArrowRight' ? 16 : 0;
      if (step === 0) return;
      event.preventDefault();
      const header = (event.target as HTMLElement).closest('th');
      this.resize(key, (this.widths[key] ?? header?.getBoundingClientRect().width ?? 160) + step);
    },

    // --- cell editing ------------------------------------------------------

    cellId(row: Row, key: string) {
      return `${row[idKey]}:${key}`;
    },
    isEditing(row: Row, key: string) {
      return this.editing === this.cellId(row, key);
    },
    startEdit(row: Row, key: string) {
      if (!editable.includes(key)) return;
      const cell = this.cellId(row, key);
      this.editing = cell;
      this.draft = String(row[key]);
      // The button that was focused is now hidden, so focus has to be handed to
      // the editor explicitly or the next keystroke lands on the body. A frame
      // after the tick: x-show sets display in its own effect, and focus() on a
      // still-hidden input does nothing at all.
      this.$nextTick(() =>
        requestAnimationFrame(() => {
          const editor = root.querySelector<HTMLInputElement>(`[data-editor="${cell}"]`);
          editor?.focus();
          editor?.select();
        }),
      );
    },
    cancel() {
      const cell = this.editing;
      this.editing = '';
      this.$nextTick(() => this.focusCell(cell));
    },
    async commit() {
      const [id, key] = this.editing.split(':');
      const row = this.rows.find((candidate) => String(candidate[idKey]) === id);
      if (!row) return this.cancel();

      // Rejected drafts keep the editor open — losing what someone typed
      // because it was the wrong shape is the worse of the two failures.
      const numeric = typeof row[key] === 'number';
      const draft = this.draft.trim();
      if (!draft) return this.$store.toast.show('That cell cannot be empty.', 'danger');
      if (numeric && Number.isNaN(Number(draft))) {
        return this.$store.toast.show('That is not a number.', 'danger');
      }

      const cell = this.editing;
      this.editing = '';
      this.saving = true;

      try {
        await save(config.latency ?? 400);
        row[key] = numeric ? Number(draft) : draft;
        this.$store.toast.show('Saved.', 'success');
      } catch (error) {
        // The row still holds the old value — the write happens after the save,
        // so a rejected one leaves nothing to undo.
        this.$store.toast.show(
          error instanceof Error ? error.message : 'Could not save that cell.',
          'danger',
        );
      } finally {
        this.saving = false;
        this.$nextTick(() => this.focusCell(cell));
      }
    },

    lastCell: '',
    focusCell(cell: string) {
      if (!cell) return;
      this.lastCell = cell;
      root.querySelector<HTMLElement>(`[data-cell="${cell}"]`)?.focus();
    },
    /** Arrow keys walk the editable cells: left/right by column, up/down by row. */
    move(event: KeyboardEvent, dx: number, dy: number) {
      const cells = [...root.querySelectorAll<HTMLElement>('[data-cell]')];
      const index = cells.indexOf(document.activeElement as HTMLElement);
      if (index === -1) return;

      event.preventDefault();
      const perRow = editable.length;
      const next = index + dx + dy * perRow;
      cells[Math.min(Math.max(next, 0), cells.length - 1)]?.focus();
    },
  });
}
