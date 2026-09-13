/**
 * File upload, preview and lightbox — RFC-001 M5b.
 *
 * One component rather than three, because the three share one list: the
 * lightbox shows what the previews show, and the previews show what the drop
 * zone accepted. Splitting them would mean syncing the same array across three
 * Alpine scopes.
 *
 * There is no upload dependency here and no lightbox dependency either. The
 * lightbox is a dialog over the overlay store with the same `x-focus-trap` the
 * modal and drawer use — PhotoSwipe measured 17.0 KB gz to replace primitives
 * this bundle already ships (RFC-001 D11).
 *
 * `upload()` fakes its progress. It is the one seam to replace with a real
 * request; nothing above it changes when you do.
 */
import { component } from './table';

export interface FileItem {
  id: number;
  name: string;
  /** Bytes. Rendered through `size` below, never printed raw. */
  bytes: number;
  type: string;
  /** Object URL for an image, or null for anything without a thumbnail. */
  url: string | null;
  progress: number;
  status: 'uploading' | 'done';
}

export interface SeedFile {
  name: string;
  bytes: number;
  type: string;
  /** Already-hosted preview, so the page has something to show on first load. */
  url?: string;
}

export interface FileDropConfig {
  /** Rejected above this, in bytes. */
  maxBytes: number;
  /** MIME prefixes and extensions the zone accepts, e.g. `image/`, `.pdf`. */
  accept: string[];
  seed?: SeedFile[];
}

const KB = 1024;

/** An extension-shaped icon name, so a preview tile is never empty. */
const iconFor = (type: string, name: string) => {
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'file-text';
  if (/\.(csv|xlsx?|numbers)$/.test(name)) return 'table-2';
  if (/\.(zip|tar|gz)$/.test(name)) return 'file-archive';
  return 'file';
};

export function fileDrop(config: FileDropConfig) {
  let seq = 0;

  const accepts = (file: File) =>
    config.accept.some((rule) =>
      rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) : file.type.startsWith(rule),
    );

  return component({
    items: (config.seed ?? []).map<FileItem>((seed): FileItem => ({
      id: ++seq,
      name: seed.name,
      bytes: seed.bytes,
      type: seed.type,
      url: seed.url ?? null,
      progress: 100,
      status: 'done',
    })),
    /** Tracks nested dragenter/dragleave pairs, which fire per child element. */
    depth: 0,
    viewing: null as number | null,

    get dragging() {
      return this.depth > 0;
    },

    /** Only what a lightbox can actually show, in the order the tiles render. */
    get images(): FileItem[] {
      return this.items.filter((item: FileItem) => item.url !== null);
    },

    get current(): FileItem | null {
      return this.images.find((item: FileItem) => item.id === this.viewing) ?? null;
    },

    size(bytes: number) {
      return bytes < KB * KB
        ? `${Math.max(1, Math.round(bytes / KB))} KB`
        : `${(bytes / KB / KB).toFixed(1)} MB`;
    },

    icon(item: FileItem) {
      return iconFor(item.type, item.name);
    },

    onDragEnter() {
      this.depth++;
    },
    onDragLeave() {
      this.depth = Math.max(0, this.depth - 1);
    },
    onDrop(event: DragEvent) {
      this.depth = 0;
      this.add(event.dataTransfer?.files);
    },
    onPick(event: Event) {
      const input = event.target as HTMLInputElement;
      this.add(input.files);
      // Same file twice in a row is still a change the user made.
      input.value = '';
    },

    add(list: FileList | null | undefined) {
      for (const file of [...(list ?? [])]) {
        if (!accepts(file)) {
          this.$store.toast.show(`${file.name} is not a supported type.`, 'danger');
          continue;
        }
        if (file.size > config.maxBytes) {
          this.$store.toast.show(`${file.name} is over ${this.size(config.maxBytes)}.`, 'danger');
          continue;
        }

        const item: FileItem = {
          id: ++seq,
          name: file.name,
          bytes: file.size,
          type: file.type,
          url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          progress: 0,
          status: 'uploading',
        };
        this.items.push(item);
        this.upload(item);
      }
    },

    /** Stands in for the request: same states, same progress, no server. */
    upload(item: FileItem) {
      const timer = setInterval(() => {
        const live = this.items.find((candidate) => candidate.id === item.id);
        if (!live) return clearInterval(timer);

        live.progress = Math.min(100, live.progress + 10 + Math.random() * 20);
        if (live.progress < 100) return;

        clearInterval(timer);
        live.progress = 100;
        live.status = 'done';
        this.$store.toast.show(`${live.name} uploaded.`, 'success');
      }, 220);
    },

    remove(id: number) {
      const item = this.items.find((candidate) => candidate.id === id);
      // A blob URL the browser keeps alive is a leak the page cannot see.
      if (item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
      this.items = this.items.filter((candidate) => candidate.id !== id);
      if (this.viewing === id) this.close();
    },

    open(id: number) {
      this.viewing = id;
      this.$store.overlay.open('lightbox');
    },
    close() {
      this.viewing = null;
      this.$store.overlay.close();
    },
    /** Wraps at both ends — an image viewer that dead-ends is a worse one. */
    step(delta: number) {
      const images = this.images;
      if (images.length === 0) return;
      const index = images.findIndex((item: FileItem) => item.id === this.viewing);
      this.viewing = images[(index + delta + images.length) % images.length].id;
    },
  });
}
