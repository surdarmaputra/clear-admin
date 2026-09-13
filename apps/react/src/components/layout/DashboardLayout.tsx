import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
  children: ReactNode;
}

export function DashboardLayout({ title, breadcrumb = [], children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar') === 'collapsed');
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="bg-graphite/50 fixed inset-0 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          breadcrumb={breadcrumb}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
