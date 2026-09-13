import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Field, describedBy } from './Field';

const controlClass =
  'w-full rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption ' +
  'text-ink-primary transition-colors placeholder:text-ink-secondary ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, required = false, className = '', ...rest },
  ref,
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        id={id}
        name={rest.name ?? id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass + (error ? ' border-danger' : '') + ' ' + className}
        required={required}
        {...rest}
      />
    </Field>
  );
});
