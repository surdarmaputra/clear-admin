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
      <ol className="flex items-center gap-1 text-caption">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-ink-secondary">/</span>}
            {item.href ? (
              <Link to={item.href} className="text-ink-secondary hover:text-ink-primary">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-primary" aria-current="page">
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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-surface-page px-4">
      <button
        type="button"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
        className="grid size-9 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        {breadcrumb.length > 0 ? (
          <Breadcrumb items={breadcrumb} />
        ) : (
          <h1 className="font-display truncate text-subheading font-semibold tracking-display">
            {title}
          </h1>
        )}
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative grid size-9 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
      >
        <Bell size={18} />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-electric-blue" />
      </button>

      <ThemeToggle />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Account"
            className="flex items-center gap-2 rounded-control p-1 transition-colors hover:bg-surface-hover"
          >
            <span className="grid size-7 place-items-center rounded-full bg-surface-hover text-micro font-semibold text-ink-primary">
              SD
            </span>
            <ChevronDown size={14} className="text-ink-secondary" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-50 min-w-40 rounded-card border border-hairline bg-surface-card p-1 shadow-card"
          >
            <DropdownMenu.Item asChild>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-control px-3 py-2 text-caption text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary outline-none cursor-default"
              >
                <User size={16} /> Profile
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-control px-3 py-2 text-caption text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary outline-none cursor-default"
              >
                <Settings size={16} /> Settings
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 border-t border-hairline" />
            <DropdownMenu.Item asChild>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-control px-3 py-2 text-caption text-danger transition-colors hover:bg-danger/10 outline-none cursor-default"
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
