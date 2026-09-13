import * as RProgress from '@radix-ui/react-progress';

type Tone = 'accent' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

interface ProgressProps {
  label: string;
  value: number;
  max?: number;
  showLabel?: boolean;
  tone?: Tone;
  className?: string;
}

export function Progress({
  label,
  value,
  max = 100,
  showLabel = false,
  tone = 'accent',
  className = '',
}: ProgressProps) {
  const percent = Math.round((Math.min(Math.max(value, 0), max) / max) * 100);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-caption font-medium">{label}</span>
          <span className="tabular text-micro text-ink-secondary">{percent}%</span>
        </div>
      )}
      <RProgress.Root
        value={percent}
        aria-label={label}
        className="bg-surface-hover h-2 w-full overflow-hidden rounded-full"
      >
        <RProgress.Indicator
          className={`h-full rounded-full transition-[width] duration-300 ${tones[tone]}`}
          style={{ width: `${percent}%` }}
        />
      </RProgress.Root>
    </div>
  );
}
