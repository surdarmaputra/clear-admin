import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, description, className = '', children }: CardProps) {
  return (
    <div
      className={`rounded-card border-hairline bg-surface-card shadow-card border p-6 ${className}`}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-title-sm font-semibold">{title}</h2>}
          {description && <p className="text-caption text-ink-secondary mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
