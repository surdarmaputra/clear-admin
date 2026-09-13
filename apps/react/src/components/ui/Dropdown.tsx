import * as RDropdown from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface DropdownProps {
  label?: string;
  align?: 'start' | 'end';
  trigger?: ReactNode;
  children: ReactNode;
}

export function Dropdown({ label = 'Options', align = 'start', trigger, children }: DropdownProps) {
  return (
    <RDropdown.Root>
      <RDropdown.Trigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption font-medium transition-colors hover:bg-surface-hover"
          >
            {label}
            <ChevronDown size={14} className="text-ink-secondary" />
          </button>
        )}
      </RDropdown.Trigger>

      <RDropdown.Portal>
        <RDropdown.Content
          align={align}
          sideOffset={4}
          className="z-30 w-52 rounded-card border border-hairline bg-surface-card p-1 shadow-raised"
        >
          {children}
        </RDropdown.Content>
      </RDropdown.Portal>
    </RDropdown.Root>
  );
}

interface DropdownItemProps {
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  onClick?: () => void;
  children: ReactNode;
}

export function DropdownItem({
  icon,
  tone = 'default',
  onClick,
  children,
}: DropdownItemProps) {
  return (
    <RDropdown.Item
      onClick={onClick}
      className={
        'flex cursor-default select-none items-center gap-2 rounded-control px-3 py-2 text-caption outline-none ' +
        (tone === 'danger'
          ? 'text-danger data-[highlighted]:bg-danger/10'
          : 'text-ink-secondary data-[highlighted]:bg-surface-hover data-[highlighted]:text-ink-primary')
      }
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </RDropdown.Item>
  );
}

export function DropdownSeparator() {
  return <RDropdown.Separator className="my-1 border-t border-hairline" />;
}
