import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Radio } from '@/components/ui/Radio';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/lib/toast';

const countryOptions = [
  { value: 'gb', label: 'United Kingdom' },
  { value: 'id', label: 'Indonesia' },
  { value: 'us', label: 'United States' },
];

export function ComponentsFormsPage() {
  const [country, setCountry] = useState('gb');
  const [cycle, setCycle] = useState('monthly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(false);
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('');

  return (
    <DashboardLayout title="Forms" breadcrumb={[{ label: 'Components' }, { label: 'Forms' }]}>
      <div className="flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Forms</h1>
          <p className="text-caption text-ink-secondary mt-1">
            Every control carries a label, and a hint or error is wired to it by id.
          </p>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.show('Settings saved', 'success');
          }}
        >
          <Card title="Text controls">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="company" label="Company" placeholder="Analytical Engines Ltd" required />
              <Input
                id="billing-email"
                label="Billing email"
                type="email"
                placeholder="billing@example.com"
                hint="Invoices and receipts go here."
              />
              <Input
                id="vat"
                label="VAT number"
                defaultValue="GB-0000"
                error="That does not look like a VAT number."
              />
              <Select
                id="country"
                label="Country"
                options={countryOptions}
                value={country}
                onValueChange={setCountry}
              />
              <div className="sm:col-span-2">
                <Textarea
                  id="notes"
                  label="Invoice notes"
                  placeholder="Printed at the bottom of every invoice"
                />
              </div>
            </div>
          </Card>

          <Card title="Choice controls">
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset className="flex flex-col gap-3">
                <legend className="text-caption mb-1 font-medium">Billing cycle</legend>
                <Radio
                  id="cycle-monthly"
                  name="cycle"
                  value="monthly"
                  label="Monthly"
                  checked={cycle === 'monthly'}
                  onChange={() => setCycle('monthly')}
                />
                <Radio
                  id="cycle-yearly"
                  name="cycle"
                  value="yearly"
                  label="Yearly"
                  hint="Two months free."
                  checked={cycle === 'yearly'}
                  onChange={() => setCycle('yearly')}
                />
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-caption mb-1 font-medium">Email me about</legend>
                <Checkbox id="notify-invoices" label="New invoices" defaultChecked />
                <Checkbox id="notify-failures" label="Failed payments" />
                <Checkbox
                  id="notify-product"
                  label="Product updates"
                  hint="At most once a month."
                />
              </fieldset>
            </div>
          </Card>

          <Card
            title="Switch"
            description="An immediate setting, not a form field waiting on submit."
          >
            <div className="flex flex-col gap-4">
              <Switch
                id="auto-renew"
                label="Auto-renew"
                hint="Charge the card on file each cycle."
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
              <Switch
                id="usage-alerts"
                label="Usage alerts"
                hint="Warn me at 80% of the plan limit."
                checked={usageAlerts}
                onCheckedChange={setUsageAlerts}
              />
              <Switch
                id="sandbox"
                label="Sandbox mode"
                hint="Not available on this plan."
                disabled
              />
            </div>
          </Card>

          <Card title="Date picker">
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                id="period-start"
                label="Period start"
                value={periodStart}
                onChange={setPeriodStart}
              />
              <DatePicker
                id="period-end"
                label="Period end"
                value={periodEnd}
                onChange={setPeriodEnd}
                hint="Leave empty for an open period."
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit">Save settings</Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => toast.show('Changes discarded', 'info')}
            >
              Discard
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
