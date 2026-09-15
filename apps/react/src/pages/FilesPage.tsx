/**
 * File upload, preview and lightbox — RFC-001 M5b React equivalent.
 *
 * Same three sections as the HTML page: drop zone, uploads list, gallery.
 * The lightbox reuses @radix-ui/react-dialog, already in the bundle.
 * upload() fakes progress; swap it for a real request without touching
 * anything above it.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ChevronLeft,
  ChevronRight,
  File,
  FileArchive,
  FileText,
  Folder,
  Maximize2,
  Paperclip,
  Table2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { toast } from '@/lib/toast';

interface FileItem {
  id: number;
  name: string;
  bytes: number;
  type: string;
  url: string | null;
  progress: number;
  status: 'uploading' | 'done';
}

const KB = 1024;
const MAX_BYTES = 8 * KB * KB;
const ACCEPT = ['image/', 'application/pdf', '.csv', '.zip'];

const SEED: FileItem[] = [
  { id: 1, name: 'storefront.svg', bytes: 738, type: 'image/svg+xml', url: '/samples/storefront.svg', progress: 100, status: 'done' },
  { id: 2, name: 'ledger.svg', bytes: 730, type: 'image/svg+xml', url: '/samples/ledger.svg', progress: 100, status: 'done' },
  { id: 3, name: 'warehouse.svg', bytes: 736, type: 'image/svg+xml', url: '/samples/warehouse.svg', progress: 100, status: 'done' },
  { id: 4, name: 'receipts.svg', bytes: 734, type: 'image/svg+xml', url: '/samples/receipts.svg', progress: 100, status: 'done' },
  { id: 5, name: 'q3-invoices.csv', bytes: 184_320, type: 'text/csv', url: null, progress: 100, status: 'done' },
  { id: 6, name: 'contract-2026.pdf', bytes: 1_260_000, type: 'application/pdf', url: null, progress: 100, status: 'done' },
];

function accepts(file: File): boolean {
  return ACCEPT.some((rule) =>
    rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) : file.type.startsWith(rule),
  );
}

function iconFor(type: string, name: string) {
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (/\.(csv|xlsx?|numbers)$/.test(name)) return 'csv';
  if (/\.(zip|tar|gz)$/.test(name)) return 'zip';
  return 'file';
}

function formatSize(bytes: number): string {
  return bytes < KB * KB
    ? `${Math.max(1, Math.round(bytes / KB))} KB`
    : `${(bytes / KB / KB).toFixed(1)} MB`;
}

function FileIcon({ type, name }: { type: string; name: string }) {
  const kind = iconFor(type, name);
  const cls = 'bg-surface-hover text-ink-secondary grid size-11 shrink-0 place-items-center rounded-control';
  if (kind === 'pdf') return <span className={cls}><FileText size={18} /></span>;
  if (kind === 'csv') return <span className={cls}><Table2 size={18} /></span>;
  if (kind === 'zip') return <span className={cls}><FileArchive size={18} /></span>;
  return <span className={cls}><File size={18} /></span>;
}

export function FilesPage() {
  const [items, setItems] = useState<FileItem[]>(SEED);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const depthRef = useRef(0);
  const seqRef = useRef(SEED.length);

  const images = items.filter((item) => item.url !== null);
  const current = images.find((item) => item.id === viewing) ?? null;

  const open = useCallback((id: number) => setViewing(id), []);
  const close = useCallback(() => setViewing(null), []);

  const step = useCallback(
    (delta: number) => {
      if (images.length === 0) return;
      const idx = images.findIndex((item) => item.id === viewing);
      setViewing(images[(idx + delta + images.length) % images.length]!.id);
    },
    [images, viewing],
  );

  useEffect(() => {
    if (viewing === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing, step]);

  function simulateUpload(item: FileItem) {
    const timer = setInterval(() => {
      setItems((prev) => {
        const live = prev.find((c) => c.id === item.id);
        if (!live) {
          clearInterval(timer);
          return prev;
        }
        const next = Math.min(100, live.progress + 10 + Math.random() * 20);
        if (next >= 100) {
          clearInterval(timer);
          toast.show(`${live.name} uploaded.`, 'success');
          return prev.map((c) => (c.id === item.id ? { ...c, progress: 100, status: 'done' } : c));
        }
        return prev.map((c) => (c.id === item.id ? { ...c, progress: next } : c));
      });
    }, 220);
  }

  function addFiles(list: FileList | null | undefined) {
    for (const file of [...(list ?? [])]) {
      if (!accepts(file)) {
        toast.show(`${file.name} is not a supported type.`, 'danger');
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.show(`${file.name} is over ${formatSize(MAX_BYTES)}.`, 'danger');
        continue;
      }
      const item: FileItem = {
        id: ++seqRef.current,
        name: file.name,
        bytes: file.size,
        type: file.type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        progress: 0,
        status: 'uploading',
      };
      setItems((prev) => [...prev, item]);
      simulateUpload(item);
    }
  }

  function remove(id: number) {
    setItems((prev) => {
      const item = prev.find((c) => c.id === id);
      if (item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
      return prev.filter((c) => c.id !== id);
    });
    if (viewing === id) close();
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    depthRef.current++;
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current === 0) setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    depthRef.current = 0;
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <DashboardLayout title="Files" breadcrumb={[{ label: 'Files' }]}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Files</h1>
          <p className="text-caption text-ink-secondary mt-1 max-w-3xl">
            Drag files onto the zone, or pick them with the keyboard — the input behind the label
            is a real one. Images get a thumbnail and open in the lightbox; everything else gets an
            icon by type. Uploads are simulated in the browser, so nothing leaves the page.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={onDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`rounded-card flex flex-col items-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? 'border-accent bg-surface-hover'
              : 'border-hairline bg-surface-card'
          }`}
        >
          <span className="bg-surface-hover text-ink-secondary grid size-11 place-items-center rounded-full">
            <Upload size={20} />
          </span>
          <div>
            <p className="text-caption font-semibold">Drop files here</p>
            <p className="text-caption text-ink-secondary mt-1">
              Images, PDF, CSV or ZIP. Up to 8 MB each.
            </p>
          </div>
          <label className="focus-within:shadow-focus inline-flex cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 py-2 text-caption font-medium text-paper transition-colors hover:bg-cobalt">
            <Paperclip size={16} />
            Choose files
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.csv,.zip"
              className="sr-only"
              onChange={onPick}
            />
          </label>
        </div>

        {/* Uploads list */}
        <Card
          title="Uploads"
          description="Progress, type and size for everything the zone accepted."
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="bg-surface-hover text-ink-secondary grid size-11 place-items-center rounded-full">
                <Folder size={20} />
              </span>
              <div>
                <p className="text-caption font-semibold">No files yet</p>
                <p className="text-caption text-ink-secondary mt-1">
                  Drop something onto the zone above to see the preview and progress states.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-hairline flex flex-col divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {item.url ? (
                    <button
                      type="button"
                      onClick={() => open(item.id)}
                      aria-label={`Preview ${item.name}`}
                      className="border-hairline size-11 shrink-0 overflow-hidden rounded-control border"
                    >
                      <img src={item.url} alt={item.name} className="size-full object-cover" />
                    </button>
                  ) : (
                    <FileIcon type={item.type} name={item.name} />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-caption truncate font-medium">{item.name}</p>
                    <p className="text-micro text-ink-secondary">
                      {formatSize(item.bytes)}
                      {item.status === 'uploading' && ' · uploading'}
                    </p>
                    {item.status === 'uploading' && (
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.progress)}
                        aria-label={`Uploading ${item.name}`}
                        className="bg-surface-hover mt-2 h-1.5 w-full overflow-hidden rounded-full"
                      >
                        <div
                          className="bg-accent h-full rounded-full transition-[width] duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-ink-secondary hover:bg-surface-hover hover:text-danger grid size-8 shrink-0 place-items-center rounded-control transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Gallery */}
        {images.length > 0 && (
          <Card
            title="Gallery"
            description="Every image in the list. Click a tile, then walk the set with the arrow keys."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => open(image.id)}
                  aria-label={`Open ${image.name}`}
                  className="border-hairline group relative aspect-video overflow-hidden rounded-control border"
                >
                  <img
                    src={image.url!}
                    alt={image.name}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-graphite/40 text-paper opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 size={18} />
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Lightbox */}
        <Dialog.Root open={viewing !== null} onOpenChange={(open) => !open && close()}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-graphite/80 data-[state=closed]:animate-[overlay-hide_200ms_ease-in_forwards] data-[state=open]:animate-[overlay-show_200ms_ease-out]" />
            <Dialog.Content
              className="fixed inset-4 z-50 flex items-center justify-center"
              aria-label="Image preview"
            >
              <div className="relative flex max-h-full w-full max-w-3xl flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Dialog.Title className="text-caption truncate font-medium text-paper">
                    {current?.name}
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="Close preview"
                    className="grid size-9 shrink-0 place-items-center rounded-control text-paper transition-colors hover:bg-paper/10"
                  >
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="grid size-9 shrink-0 place-items-center rounded-control text-paper transition-colors hover:bg-paper/10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {current && (
                    <img
                      src={current.url!}
                      alt={current.name}
                      className="bg-surface-card max-h-[70vh] min-w-0 flex-1 rounded-card object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="grid size-9 shrink-0 place-items-center rounded-control text-paper transition-colors hover:bg-paper/10"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </DashboardLayout>
  );
}
