import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout
      heading="Reset password"
      subheading="We will email you a link to choose a new one."
      footer={
        <p className="text-caption text-ink-secondary mt-6 text-center">
          Remembered it?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {!sent ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <Alert variant="success" title="Check your inbox">
            If an account exists for that address, a reset link is on its way.
          </Alert>
          <Button variant="secondary" asChild className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
