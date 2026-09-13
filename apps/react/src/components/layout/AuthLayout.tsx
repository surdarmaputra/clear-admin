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
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-surface-sidebar">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid size-8 place-items-center rounded-control bg-accent text-paper">
            <span className="text-caption font-semibold">C</span>
          </span>
          <span className="font-display text-subheading font-semibold tracking-display">
            Clear Admin
          </span>
        </Link>

        <div className="rounded-card border border-hairline bg-surface-card p-6 shadow-raised">
          <h1 className="font-display text-title font-semibold tracking-display">{heading}</h1>
          {subheading && (
            <p className="mt-1 text-caption text-ink-secondary">{subheading}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer}
      </main>
    </div>
  );
}
