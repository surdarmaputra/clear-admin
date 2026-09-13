import { Compass } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <DashboardLayout title="Page not found" breadcrumb={[{ label: 'Page not found' }]}>
      <div className="grid min-h-[60vh] place-items-center rounded-card border border-hairline bg-surface-card p-6">
        <div className="max-w-sm text-center">
          <span className="inline-grid size-12 place-items-center rounded-full bg-surface-hover text-ink-secondary">
            <Compass size={24} />
          </span>
          <p className="mt-4 text-heading-sm font-semibold">404</p>
          <h2 className="mt-1 text-title-sm font-semibold">Page not found</h2>
          <p className="mt-2 text-caption text-ink-secondary">
            The page you are looking for was moved, renamed, or never existed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
