import { Compass } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <DashboardLayout title="Page not found" breadcrumb={[{ label: 'Page not found' }]}>
      <div className="rounded-card border-hairline bg-surface-card grid min-h-[60vh] place-items-center border p-6">
        <div className="max-w-sm text-center">
          <span className="bg-surface-hover text-ink-secondary inline-grid size-12 place-items-center rounded-full">
            <Compass size={24} />
          </span>
          <p className="text-heading-sm mt-4 font-semibold">404</p>
          <h2 className="text-title-sm mt-1 font-semibold">Page not found</h2>
          <p className="text-caption text-ink-secondary mt-2">
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
