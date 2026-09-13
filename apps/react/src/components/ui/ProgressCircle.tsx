type Tone = 'accent' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

interface ProgressCircleProps {
  label: string;
  value: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  tone?: Tone;
  className?: string;
}

export function ProgressCircle({
  label,
  value,
  max = 100,
  size = 72,
  showValue = true,
  tone = 'accent',
  className = '',
}: ProgressCircleProps) {
  const percent = Math.round((Math.min(Math.max(value, 0), max) / max) * 100);
  const radius = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-surface-hover"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          transform="rotate(-90 12 12)"
          className={`transition-[stroke-dashoffset] duration-300 ${tones[tone]}`}
        />
      </svg>
      {showValue && (
        <span className="tabular absolute text-caption font-semibold">{percent}%</span>
      )}
    </div>
  );
}
