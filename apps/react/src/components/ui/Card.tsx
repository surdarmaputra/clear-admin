import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, description, className = '', children }: CardProps) {
  return (
    <div className={`rounded-card border border-hairline bg-surface-card p-6 shadow-card ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-title-sm font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-caption text-ink-secondary">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
