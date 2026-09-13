import * as RDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Size = 'sm' | 'md' | 'lg';

const widths: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: Size;
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: ModalProps) {
  return (
    <RDialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="bg-graphite/50 fixed inset-0 z-50" />
        <RDialog.Content
          className={
            'rounded-card border-hairline fixed inset-x-4 bottom-4 z-50 w-auto border ' +
            'bg-surface-card shadow-raised sm:inset-auto sm:top-1/2 sm:left-1/2 ' +
            `sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 ${widths[size]}`
          }
        >
          <div className="flex items-start gap-4 p-6 pb-0">
            <div className="min-w-0 flex-1">
              <RDialog.Title className="font-display text-title-sm tracking-display font-semibold">
                {title}
              </RDialog.Title>
              {description && (
                <RDialog.Description className="text-caption text-ink-secondary mt-1">
                  {description}
                </RDialog.Description>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 shrink-0 place-items-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-caption text-ink-secondary p-6">{children}</div>

          {footer && (
            <div className="border-hairline flex justify-end gap-2 border-t p-4">{footer}</div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
