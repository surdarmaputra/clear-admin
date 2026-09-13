import { AlertCircle, CheckCircle, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'info' | 'success' | 'warning' | 'danger';

const variants: Record<Variant, { tone: string; Icon: typeof Info }> = {
  info: { tone: 'bg-info/10 text-info', Icon: Info },
  success: { tone: 'bg-success/10 text-success', Icon: CheckCircle },
  warning: { tone: 'bg-warning/10 text-warning', Icon: TriangleAlert },
  danger: { tone: 'bg-danger/10 text-danger', Icon: AlertCircle },
};

interface AlertProps {
  variant?: Variant;
  title?: string;
  className?: string;
  children?: ReactNode;
}

export function Alert({ variant = 'info', title, className = '', children }: AlertProps) {
  const { tone, Icon } = variants[variant];
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={`rounded-control flex gap-3 p-4 ${tone} ${className}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="text-caption min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={'text-ink-secondary' + (title ? ' mt-1' : '')}>{children}</div>
      </div>
    </div>
  );
}
