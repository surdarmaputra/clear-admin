import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, className = '', children }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 py-12 text-center ${className}`}>
      <span className="grid size-11 place-items-center rounded-full bg-surface-hover text-ink-secondary">
        <Inbox size={20} />
      </span>
      <div>
        <p className="text-caption font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-caption text-ink-secondary">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
