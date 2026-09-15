import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Field, describedBy } from './Field';

const controlClass =
  'w-full rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption ' +
  'text-ink-primary transition-colors cursor-pointer pr-9 placeholder:text-ink-secondary';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const d = isoToDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getMonthDays(year: number, month: number): (string | null)[] {
  const cells: (string | null)[] = [];
  const first = new Date(year, month, 1);
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  const last = new Date(year, month + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  for (let day = 1; day <= last; day++) {
    cells.push(`${year}-${pad(month + 1)}-${pad(day)}`);
  }
  return cells;
}

interface DatePickerProps {
  id: string;
  label: string;
  name?: string;
  value?: string;
  onChange?: (iso: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function DatePicker({
  id,
  label,
  name,
  value = '',
  onChange,
  hint,
  error,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => isoToDate(value) ?? new Date());
  const triggerRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = getMonthDays(year, month);
  const cursorIso = dateToIso(cursor);
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const close = useCallback(
    (refocus = true) => {
      setOpen(false);
      if (refocus) triggerRef.current?.focus();
    },
    [],
  );

  const select = useCallback(
    (iso: string) => {
      onChange?.(iso);
      const d = isoToDate(iso);
      if (d) setCursor(d);
      close();
    },
    [onChange, close],
  );

  const shiftDays = useCallback((n: number) => {
    setCursor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + n);
      return next;
    });
  }, []);

  const shiftMonths = useCallback((n: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + n, 1));
  }, []);

  // Focus cursor day when grid is shown or cursor moves
  useEffect(() => {
    if (!open) return;
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${cursorIso}"]`);
    el?.focus();
  }, [open, cursorIso]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Arrow/Page/Enter/Escape keys when open
  useEffect(() => {
    if (!open) return;
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const months: Record<string, number> = { PageUp: -1, PageDown: 1 };
    const handler = (e: KeyboardEvent) => {
      if (e.key in moves) {
        e.preventDefault();
        shiftDays(moves[e.key]!);
      } else if (e.key in months) {
        e.preventDefault();
        shiftMonths(months[e.key]!);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        select(cursorIso);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, shiftDays, shiftMonths, close, select, cursorIso]);

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <div ref={containerRef} className="relative">
        <input
          id={id}
          name={name ?? id}
          ref={triggerRef}
          type="text"
          readOnly
          value={formatDisplay(value)}
          placeholder="Pick a date"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          onClick={() => {
            if (!open && value) {
              const d = isoToDate(value);
              if (d) setCursor(d);
            }
            setOpen((o) => !o);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !open) setOpen(true);
          }}
          className={controlClass + (error ? ' border-danger' : '')}
        />
        <Calendar
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-secondary"
        />

        {open && (
          <div
            role="dialog"
            aria-label={`${label} calendar`}
            className="absolute z-30 mt-2 w-72 rounded-card border border-hairline bg-surface-card p-3 shadow-raised"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonths(-1)}
                className="grid size-8 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <p aria-live="polite" className="text-caption font-semibold">
                {monthLabel}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonths(1)}
                className="grid size-8 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => (
                <span key={d} className="text-micro tracking-label text-ink-secondary uppercase">
                  {d}
                </span>
              ))}
            </div>

            <div ref={gridRef} className="mt-1 grid grid-cols-7 gap-1">
              {days.map((iso, i) => (
                <div key={i}>
                  {iso && (
                    <button
                      type="button"
                      data-date={iso}
                      tabIndex={iso === cursorIso ? 0 : -1}
                      aria-current={iso === value ? 'date' : undefined}
                      onClick={() => select(iso)}
                      className={
                        'tabular grid size-9 w-full place-items-center rounded-control text-caption transition-colors ' +
                        (iso === value
                          ? 'bg-accent text-paper'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary')
                      }
                    >
                      {Number(iso.slice(8))}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}
