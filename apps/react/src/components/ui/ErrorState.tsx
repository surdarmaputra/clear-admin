import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The data could not be loaded. Try again in a moment.',
  className = '',
  children,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 px-6 py-12 text-center ${className}`}
    >
      <span className="bg-danger/10 text-danger grid size-11 place-items-center rounded-full">
        <TriangleAlert size={20} />
      </span>
      <div>
        <p className="text-caption font-semibold">{title}</p>
        <p className="text-caption text-ink-secondary mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
