import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { toast } from '@/lib/toast';

const languageOptions = [
  { value: 'en-gb', label: 'English (UK)' },
  { value: 'en-us', label: 'English (US)' },
  { value: 'id', label: 'Bahasa Indonesia' },
];

const timezoneOptions = [
  { value: 'europe-london', label: 'Europe/London' },
  { value: 'asia-makassar', label: 'Asia/Makassar' },
  { value: 'america-new-york', label: 'America/New_York' },
];

const dateFormatOptions = [
  { value: 'iso', label: '2026-09-12' },
  { value: 'dmy', label: '12/09/2026' },
  { value: 'mdy', label: '09/12/2026' },
];

const currencyOptions = [
  { value: 'gbp', label: 'GBP — £' },
  { value: 'usd', label: 'USD — $' },
  { value: 'idr', label: 'IDR — Rp' },
];

const notificationItems = [
  {
    id: 'notify-invoices',
    label: 'Invoice receipts',
    hint: 'One email per successful charge.',
    defaultChecked: true,
  },
  {
    id: 'notify-failures',
    label: 'Failed payments',
    hint: 'Sent immediately — this one is hard to switch off for a reason.',
    defaultChecked: true,
  },
  {
    id: 'notify-digest',
    label: 'Weekly digest',
    hint: 'Monday morning, the numbers from the week before.',
    defaultChecked: false,
  },
  {
    id: 'notify-product',
    label: 'Product updates',
    hint: 'What changed in the app. Roughly monthly.',
    defaultChecked: false,
  },
];

export function SettingsPage() {
  const [language, setLanguage] = useState('en-gb');
  const [timezone, setTimezone] = useState('europe-london');
  const [dateFormat, setDateFormat] = useState('iso');
  const [currency, setCurrency] = useState('gbp');
  const [compactTables, setCompactTables] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((n) => [n.id, n.defaultChecked])),
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: (
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.show('Preferences saved', 'success');
          }}
        >
          <Card title="Workspace" description="Shown on invoices and in the browser title.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="workspace-name"
                label="Workspace name"
                defaultValue="Analytical Engines"
                required
              />
              <Input
                id="workspace-slug"
                label="URL slug"
                defaultValue="analytical-engines"
                hint="clear-admin.dev/analytical-engines"
              />
            </div>
          </Card>

          <Card title="Locale" description="Dates and money everywhere in the app follow these.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="language"
                label="Language"
                options={languageOptions}
                value={language}
                onValueChange={setLanguage}
              />
              <Select
                id="timezone"
                label="Time zone"
                options={timezoneOptions}
                value={timezone}
                onValueChange={setTimezone}
              />
              <Select
                id="date-format"
                label="Date format"
                options={dateFormatOptions}
                value={dateFormat}
                onValueChange={setDateFormat}
              />
              <Select
                id="currency"
                label="Currency"
                options={currencyOptions}
                value={currency}
                onValueChange={setCurrency}
              />
            </div>
          </Card>

          <Card title="Display" description="Preferences that only affect this browser.">
            <div className="flex flex-col gap-4">
              <Switch
                id="compact-tables"
                label="Compact tables"
                hint="Tighter rows, more of them on screen."
                checked={compactTables}
                onCheckedChange={setCompactTables}
              />
              <Switch
                id="reduce-motion"
                label="Reduce motion"
                hint="Skips the overlay and toast transitions."
                checked={reduceMotion}
                onCheckedChange={setReduceMotion}
              />
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="reset">
              Discard
            </Button>
            <Button type="submit">Save preferences</Button>
          </div>
        </form>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: (
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.show('Notification settings saved', 'success');
          }}
        >
          <Card title="Email" description="Every switch posts its state with the form.">
            <div className="flex flex-col gap-4">
              {notificationItems.map(({ id, label, hint }) => (
                <Switch
                  key={id}
                  id={id}
                  label={label}
                  hint={hint}
                  checked={notifications[id]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [id]: checked }))
                  }
                />
              ))}
            </div>
          </Card>
          <div className="flex justify-end">
            <Button type="submit">Save notifications</Button>
          </div>
        </form>
      ),
    },
    {
      id: 'danger',
      label: 'Danger zone',
      content: (
        <Card
          title="Delete this workspace"
          description="Every invoice, member and export goes with it. This cannot be undone."
        >
          <Button variant="secondary" onClick={() => setDeleteOpen(true)}>
            Delete workspace
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <DashboardLayout title="Settings" breadcrumb={[{ label: 'Account' }, { label: 'Settings' }]}>
      <div className="flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Settings</h1>
          <p className="text-caption text-ink-secondary mt-1">
            Workspace preferences. Nothing here posts anywhere — the forms raise a toast so the
            interaction is complete without a backend.
          </p>
        </div>

        <Tabs tabs={tabs} />
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this workspace?"
        description="48 invoices and 3 members will be removed immediately."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDeleteOpen(false);
                toast.show('Workspace deleted', 'danger');
              }}
            >
              Delete workspace
            </Button>
          </>
        }
      >
        <p className="text-caption">
          Deleting is permanent. Export anything you still need before you confirm — there is no
          recovery window.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
