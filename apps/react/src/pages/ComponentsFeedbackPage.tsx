import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Progress } from '@/components/ui/Progress';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/lib/toast';

const toasts = [
  { variant: 'info' as const, label: 'Info', message: 'Export queued — we will email the link.' },
  { variant: 'success' as const, label: 'Success', message: 'Changes saved.' },
  { variant: 'warning' as const, label: 'Warning', message: 'Two rows were skipped.' },
  { variant: 'danger' as const, label: 'Danger', message: 'Could not reach the server.' },
];

export function ComponentsFeedbackPage() {
  return (
    <DashboardLayout title="Feedback" breadcrumb={[{ label: 'Components' }, { label: 'Feedback' }]}>
      <div className="flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Feedback</h1>
          <p className="text-caption text-ink-secondary mt-1">
            What the interface says back. Every tint is paired with an icon, so colour never carries
            the meaning alone.
          </p>
        </div>

        <Card
          title="Toast"
          description="Raise one from anywhere with toast.show(message, variant)."
        >
          <div className="flex flex-wrap gap-3">
            {toasts.map(({ variant, label, message }) => (
              <Button
                key={variant}
                variant="secondary"
                onClick={() => toast.show(message, variant)}
              >
                {label}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() => toast.show('This one stays until dismissed.', 'info', 0)}
            >
              Persistent
            </Button>
          </div>
        </Card>

        <Card title="Alert" description="Inline, and it stays until the condition is gone.">
          <div className="flex flex-col gap-3">
            <Alert variant="info" title="Scheduled maintenance">
              The API is read-only on Sunday between 02:00 and 04:00 UTC.
            </Alert>
            <Alert variant="success" title="Invoice sent">
              Ada will get it within a few minutes.
            </Alert>
            <Alert variant="warning" title="Card expiring">
              The card on file expires next month.
            </Alert>
            <Alert variant="danger" title="Payment failed">
              The last charge was declined. Update the card to keep the plan active.
            </Alert>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Empty state" className="flex flex-col">
            <EmptyState
              title="No orders yet"
              description="Orders appear here once a customer checks out."
            >
              <Button variant="secondary">Create test order</Button>
            </EmptyState>
          </Card>

          <Card title="Error state" className="flex flex-col">
            <ErrorState>
              <Button variant="secondary">Try again</Button>
            </ErrorState>
          </Card>

          <Card title="Loading — skeleton" description="Holds the shape the content will take.">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Card>

          <Card
            title="Loading — spinner"
            description="For a wait too short to be worth a skeleton."
          >
            <div className="text-caption text-ink-secondary flex items-center gap-3 py-6">
              <Spinner label="Loading orders" />
              Loading orders…
            </div>
          </Card>

          <Card title="Progress — bar" description="For work with a known end.">
            <div className="flex flex-col gap-4">
              <Progress label="Seats used" value={34} max={50} showLabel />
              <Progress label="Storage used" value={78} tone="warning" showLabel />
              <Progress label="Quota used" value={96} tone="danger" showLabel />
            </div>
          </Card>

          <Card title="Progress — circle" description="The same value where a bar has no room.">
            <div className="flex flex-wrap items-center justify-around gap-6 py-2">
              <ProgressCircle label="Onboarding complete" value={25} />
              <ProgressCircle label="Import complete" value={68} tone="success" />
              <ProgressCircle label="Retries used" value={90} tone="danger" />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
