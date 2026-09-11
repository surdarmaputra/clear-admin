/** Shared visual contract for the text-like form controls. */
export const controlClass =
  'w-full rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption ' +
  'text-ink-primary transition-colors placeholder:text-ink-secondary ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

/** Ties a control to its hint or error text for assistive technology. */
export const describedBy = (id: string, hint?: string, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
