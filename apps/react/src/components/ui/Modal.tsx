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
        <RDialog.Overlay className="fixed inset-0 z-50 bg-graphite/50" />
        <RDialog.Content
          className={
            'fixed inset-x-4 bottom-4 z-50 w-auto rounded-card border border-hairline ' +
            'bg-surface-card shadow-raised sm:inset-auto sm:left-1/2 sm:top-1/2 ' +
            `sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full ${widths[size]}`
          }
        >
          <div className="flex items-start gap-4 p-6 pb-0">
            <div className="min-w-0 flex-1">
              <RDialog.Title className="font-display text-title-sm font-semibold tracking-display">
                {title}
              </RDialog.Title>
              {description && (
                <RDialog.Description className="mt-1 text-caption text-ink-secondary">
                  {description}
                </RDialog.Description>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="grid size-8 shrink-0 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 text-caption text-ink-secondary">{children}</div>

          {footer && (
            <div className="flex justify-end gap-2 border-t border-hairline p-4">{footer}</div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
