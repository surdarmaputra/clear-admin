import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Props {
  title: string;
}

export function PlaceholderPage({ title }: Props) {
  return (
    <DashboardLayout title={title}>
      <div className="rounded-card border border-hairline bg-surface-card p-6">
        <p className="text-ink-secondary">{title} — coming soon.</p>
      </div>
    </DashboardLayout>
  );
}
