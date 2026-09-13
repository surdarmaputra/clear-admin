import { Link } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  return (
    <AuthLayout
      heading="Sign in"
      subheading="Welcome back. Enter your details."
      footer={
        <p className="text-caption text-ink-secondary mt-6 text-center">
          No account?{' '}
          <Link to="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" method="post" action="#">
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
          autoComplete="current-password"
          required
        />
        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Remember me" />
          <Link to="/forgot-password" className="text-caption text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
