import * as RDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Side = 'left' | 'right';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: Side;
  footer?: ReactNode;
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  footer,
  children,
}: DrawerProps) {
  return (
    <RDialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-graphite/50" />
        <RDialog.Content
          className={
            'fixed inset-y-0 z-50 flex w-full max-w-sm flex-col bg-surface-card shadow-raised ' +
            'transition-transform duration-200 ' +
            (side === 'right' ? 'right-0' : 'left-0')
          }
        >
          <div className="flex items-center gap-3 border-b border-hairline p-4">
            <RDialog.Title className="font-display min-w-0 flex-1 text-subheading font-semibold tracking-display">
              {title}
            </RDialog.Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="grid size-8 shrink-0 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-caption text-ink-secondary">
            {children}
          </div>

          {footer && (
            <div className="flex justify-end gap-2 border-t border-hairline p-4">{footer}</div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
