import type { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'default';

const tones: Record<Tone, string> = {
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  default: 'bg-surface-hover text-ink-secondary',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
