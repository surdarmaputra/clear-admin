import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-paper hover:bg-cobalt',
  secondary: 'border border-hairline bg-surface-card text-ink-primary hover:bg-surface-hover',
  ghost: 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-control px-4 py-2 text-caption ' +
  'font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', asChild = false, className = '', ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp ref={ref} className={`${base} ${variants[variant]} ${className}`} {...rest} />
  );
});
