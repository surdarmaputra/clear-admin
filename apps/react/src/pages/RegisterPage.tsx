import { Link } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';

export function RegisterPage() {
  return (
    <AuthLayout
      heading="Create account"
      subheading="Set up your workspace in a minute."
      footer={
        <p className="mt-6 text-center text-caption text-ink-secondary">
          Already registered?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" method="post" action="#">
        <Input
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 12 characters."
          required
        />
        <Checkbox id="terms" label="I agree to the terms of service" />
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
