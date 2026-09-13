import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, hint, error, required = false, className = '', children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-caption font-medium">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-micro text-ink-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-micro text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}
