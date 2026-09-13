import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  ChevronRight,
  ChevronsLeft,
  Component,
  FileText,
  Folder,
  House,
  LayoutDashboard,
  PenLine,
  Settings,
  Table2,
} from 'lucide-react';
import { navigation, type NavItem } from '@/data/nav';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: House,
  'table-2': Table2,
  component: Component,
  'file-text': FileText,
  folder: Folder,
  'pen-line': PenLine,
  settings: Settings,
  'layout-dashboard': LayoutDashboard,
};

function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = iconMap[name];
  return Icon ? <Icon size={size} className="shrink-0" /> : null;
}

function norm(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

function NavGroup({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const isChildActive = item.children?.some((c) => c.href && norm(c.href) === norm(pathname));
  const [open, setOpen] = useState(isChildActive ?? false);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded-control text-caption text-ink-secondary hover:bg-surface-hover hover:text-ink-primary flex w-full items-center gap-3 px-3 py-2 transition-colors"
      >
        {item.icon && <NavIcon name={item.icon} />}
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronRight size={14} className={`transition-transform${open ? 'rotate-90' : ''}`} />
          </>
        )}
      </button>

      {open && !collapsed && (
        <ul className="mt-1 ml-5 space-y-1 pl-3">
          {item.children?.map((child) => {
            const active = child.href ? norm(child.href) === norm(pathname) : false;
            return (
              <li key={child.href}>
                <Link
                  to={child.href ?? '#'}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-control text-caption block px-3 py-1.5 transition-colors${
                    active
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function NavLink({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const active = item.href ? norm(item.href) === norm(pathname) : false;
  return (
    <li>
      <Link
        to={item.href ?? '#'}
        aria-current={active ? 'page' : undefined}
        className={`rounded-control text-caption flex items-center gap-3 px-3 py-2 transition-colors${
          active
            ? 'bg-accent/10 text-accent font-semibold'
            : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
        }`}
      >
        {item.icon && <NavIcon name={item.icon} />}
        {!collapsed && <span>{item.label}</span>}
      </Link>
    </li>
  );
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      className={`bg-surface-sidebar fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0 ${
        collapsed ? 'w-16' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="rounded-control bg-cobalt text-paper grid size-7 shrink-0 place-items-center">
          <LayoutDashboard size={16} />
        </span>
        {!collapsed && (
          <span className="font-display text-subheading tracking-display font-semibold">
            Clear Admin
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Main">
        <ul className="space-y-1">
          {navigation.map((item) =>
            item.children ? (
              <NavGroup key={item.label} item={item} collapsed={collapsed} pathname={pathname} />
            ) : (
              <NavLink key={item.label} item={item} collapsed={collapsed} pathname={pathname} />
            ),
          )}
        </ul>
      </nav>

      <div className="p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-control text-caption text-ink-secondary hover:bg-surface-hover hover:text-ink-primary hidden w-full items-center gap-3 px-3 py-2 transition-colors lg:flex"
        >
          <ChevronsLeft
            size={18}
            className={`shrink-0 transition-transform${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
