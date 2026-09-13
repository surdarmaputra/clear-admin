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
            className="rounded-control border-hairline bg-surface-card text-caption hover:bg-surface-hover inline-flex items-center gap-2 border px-3 py-2 font-medium transition-colors"
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
          className="rounded-card border-hairline bg-surface-card shadow-raised z-30 w-52 border p-1"
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

export function DropdownItem({ icon, tone = 'default', onClick, children }: DropdownItemProps) {
  return (
    <RDropdown.Item
      onClick={onClick}
      className={
        'rounded-control text-caption flex cursor-default items-center gap-2 px-3 py-2 outline-none select-none ' +
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
  return <RDropdown.Separator className="border-hairline my-1 border-t" />;
}
