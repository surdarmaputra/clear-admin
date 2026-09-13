import { Bell, ChevronDown, LogOut, Menu, Settings, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ThemeToggle } from './ThemeToggle';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
  onMobileMenuOpen: () => void;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-caption flex items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-ink-secondary">/</span>}
            {item.href ? (
              <Link to={item.href} className="text-ink-secondary hover:text-ink-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-primary font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Topbar({ title, breadcrumb = [], onMobileMenuOpen }: TopbarProps) {
  return (
    <header className="bg-surface-page sticky top-0 z-20 flex h-14 items-center gap-3 px-4">
      <button
        type="button"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
        className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-9 place-items-center transition-colors lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        {breadcrumb.length > 0 ? (
          <Breadcrumb items={breadcrumb} />
        ) : (
          <h1 className="font-display text-subheading tracking-display truncate font-semibold">
            {title}
          </h1>
        )}
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary relative grid size-9 place-items-center transition-colors"
      >
        <Bell size={18} />
        <span className="bg-electric-blue absolute top-2 right-2 size-1.5 rounded-full" />
      </button>

      <ThemeToggle />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Account"
            className="rounded-control hover:bg-surface-hover flex items-center gap-2 p-1 transition-colors"
          >
            <span className="bg-surface-hover text-micro text-ink-primary grid size-7 place-items-center rounded-full font-semibold">
              SD
            </span>
            <ChevronDown size={14} className="text-ink-secondary" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="rounded-card border-hairline bg-surface-card shadow-card z-50 min-w-40 border p-1"
          >
            <DropdownMenu.Item asChild>
              <Link
                to="/profile"
                className="rounded-control text-caption text-ink-secondary hover:bg-surface-hover hover:text-ink-primary flex cursor-default items-center gap-2 px-3 py-2 transition-colors outline-none"
              >
                <User size={16} /> Profile
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                to="/settings"
                className="rounded-control text-caption text-ink-secondary hover:bg-surface-hover hover:text-ink-primary flex cursor-default items-center gap-2 px-3 py-2 transition-colors outline-none"
              >
                <Settings size={16} /> Settings
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="border-hairline my-1 border-t" />
            <DropdownMenu.Item asChild>
              <Link
                to="/login"
                className="rounded-control text-caption text-danger hover:bg-danger/10 flex cursor-default items-center gap-2 px-3 py-2 transition-colors outline-none"
              >
                <LogOut size={16} /> Sign out
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
