import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ThemeToggle } from './ThemeToggle';

interface AuthLayoutProps {
  heading: string;
  subheading?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ heading, subheading, children, footer }: AuthLayoutProps) {
  return (
    <div className="bg-surface-sidebar flex min-h-screen flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="rounded-control bg-accent text-paper grid size-8 place-items-center">
            <span className="text-caption font-semibold">C</span>
          </span>
          <span className="font-display text-subheading tracking-display font-semibold">
            Clear Admin
          </span>
        </Link>

        <div className="rounded-card border-hairline bg-surface-card shadow-raised border p-6">
          <h1 className="font-display text-title tracking-display font-semibold">{heading}</h1>
          {subheading && <p className="text-caption text-ink-secondary mt-1">{subheading}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer}
      </main>
    </div>
  );
}
