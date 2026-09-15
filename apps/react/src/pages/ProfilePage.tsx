import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/lib/toast';

const roleOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'analyst', label: 'Analyst' },
];

const user = {
  name: 'Surya Darma',
  email: 'surya@example.com',
  role: 'owner',
  bio: 'Keeps the billing pipeline honest. Ships the admin nobody has to be trained on.',
};

export function ProfilePage() {
  const [role, setRole] = useState(user.role);

  return (
    <DashboardLayout title="Profile" breadcrumb={[{ label: 'Account' }, { label: 'Profile' }]}>
      <div className="flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-title tracking-display font-semibold">{user.name}</h1>
              <span className="text-micro bg-accent/12 text-accent inline-flex items-center rounded-full px-2.5 py-0.5 font-medium">
                Owner
              </span>
            </div>
            <p className="mt-1 text-caption text-ink-secondary">{user.email}</p>
          </div>
        </div>

        <Card
          title="Profile completeness"
          description="Two of three fields filled in. The last one is a photo."
        >
          <Progress label="Profile completeness" value={67} tone="warning" showLabel />
        </Card>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.show('Profile saved', 'success');
          }}
        >
          <Card
            title="Identity"
            description="How your name appears on invoices and in the audit log."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="full-name"
                label="Full name"
                defaultValue={user.name}
                autoComplete="name"
                required
              />
              <Input
                id="profile-email"
                label="Email"
                type="email"
                defaultValue={user.email}
                autoComplete="email"
                hint="Changing this sends a confirmation to both addresses."
                required
              />
              <Select
                id="profile-role"
                label="Role"
                options={roleOptions}
                value={role}
                onValueChange={setRole}
                hint="Only an owner can change a role."
              />
              <Input id="profile-title" label="Job title" placeholder="Head of Finance" />
              <div className="sm:col-span-2">
                <Textarea
                  id="profile-bio"
                  label="Bio"
                  defaultValue={user.bio}
                  hint="Shown to teammates on the members page."
                />
              </div>
            </div>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="reset">
              Discard
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.show('Password updated', 'success');
          }}
        >
          <Card
            title="Password"
            description="Signing out everywhere else is the safe default after a change."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="current-password"
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Input
                id="new-password"
                label="New password"
                type="password"
                autoComplete="new-password"
                hint="At least 12 characters."
                required
              />
              <Input
                id="confirm-password"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
          </Card>
          <div className="flex justify-end">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
