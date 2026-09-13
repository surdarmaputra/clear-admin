import { useSyncExternalStore, useEffect } from 'react';
import * as RToast from '@radix-ui/react-toast';
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react';
import { toast, type ToastVariant } from '@/lib/toast';

const icons: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: TriangleAlert,
  danger: AlertCircle,
};

const tones: Record<ToastVariant, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

function ToastItem({
  id,
  message,
  variant,
  duration,
}: {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}) {
  const Icon = icons[variant];

  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(() => toast.dismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration]);

  return (
    <RToast.Root
      open
      onOpenChange={(open) => {
        if (!open) toast.dismiss(id);
      }}
      className="flex w-full items-start gap-3 rounded-card border border-hairline bg-surface-card p-3 shadow-raised sm:w-80"
    >
      <span className={`mt-0.5 shrink-0 ${tones[variant]}`}>
        <Icon size={18} aria-hidden />
      </span>
      <RToast.Description className="min-w-0 flex-1 text-caption">{message}</RToast.Description>
      <RToast.Action altText="Dismiss" asChild>
        <button
          type="button"
          onClick={() => toast.dismiss(id)}
          aria-label="Dismiss notification"
          className="grid size-6 shrink-0 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
        >
          <X size={14} />
        </button>
      </RToast.Action>
    </RToast.Root>
  );
}

export function ToastRegion() {
  const items = useSyncExternalStore(toast.subscribe, toast.getSnapshot);

  return (
    <RToast.Provider>
      {items.map((item) => (
        <ToastItem key={item.id} {...item} />
      ))}
      <RToast.Viewport className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6" />
    </RToast.Provider>
  );
}
