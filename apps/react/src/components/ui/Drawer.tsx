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

export function Drawer({ open, onClose, title, side = 'right', footer, children }: DrawerProps) {
  return (
    <RDialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="bg-graphite/50 fixed inset-0 z-50" />
        <RDialog.Content
          className={
            'bg-surface-card shadow-raised fixed inset-y-0 z-50 flex w-full max-w-sm flex-col ' +
            'transition-transform duration-200 ' +
            (side === 'right' ? 'right-0' : 'left-0')
          }
        >
          <div className="border-hairline flex items-center gap-3 border-b p-4">
            <RDialog.Title className="font-display text-subheading tracking-display min-w-0 flex-1 font-semibold">
              {title}
            </RDialog.Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 shrink-0 place-items-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-caption text-ink-secondary flex-1 overflow-y-auto p-4">
            {children}
          </div>

          {footer && (
            <div className="border-hairline flex justify-end gap-2 border-t p-4">{footer}</div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
