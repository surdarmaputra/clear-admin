import type { ComponentPropsWithoutRef } from 'react';

interface RadioProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'id'> {
  id: string;
  label: string;
  hint?: string;
}

export function Radio({ id, label, hint, disabled = false, ...rest }: RadioProps) {
  return (
    <div className="flex gap-2.5">
      <input
        id={id}
        type="radio"
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="border-hairline bg-surface-card accent-accent mt-0.5 size-4 shrink-0 cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60"
        {...rest}
      />
      <div className="min-w-0">
        <label htmlFor={id} className="text-caption cursor-pointer">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-micro text-ink-secondary">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
