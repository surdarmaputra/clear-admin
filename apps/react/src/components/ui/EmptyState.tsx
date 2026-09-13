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
      <span className="bg-surface-hover text-ink-secondary grid size-11 place-items-center rounded-full">
        <Inbox size={20} />
      </span>
      <div>
        <p className="text-caption font-semibold">{title}</p>
        {description && <p className="text-caption text-ink-secondary mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}
