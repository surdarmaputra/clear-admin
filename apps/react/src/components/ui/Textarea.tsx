import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Field, describedBy } from './Field';

const controlClass =
  'w-full rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption ' +
  'text-ink-primary transition-colors placeholder:text-ink-secondary resize-y ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

interface TextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, hint, error, required = false, rows = 4, className = '', ...rest },
  ref,
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={id}
        name={rest.name ?? id}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass + (error ? ' border-danger' : '') + ' ' + className}
        required={required}
        {...rest}
      />
    </Field>
  );
});
