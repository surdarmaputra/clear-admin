import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Sparkline } from './Sparkline';

type Tone = 1 | 2 | 3 | 7;

const tones: Record<Tone, { chip: string; wash: string; edge: string }> = {
  1: { chip: 'bg-series-1/12 text-series-1', wash: 'from-series-1/8', edge: 'bg-series-1' },
  2: { chip: 'bg-series-2/12 text-series-2', wash: 'from-series-2/8', edge: 'bg-series-2' },
  3: { chip: 'bg-series-3/12 text-series-3', wash: 'from-series-3/8', edge: 'bg-series-3' },
  7: { chip: 'bg-series-7/12 text-series-7', wash: 'from-series-7/8', edge: 'bg-series-7' },
};

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  higherIsBetter?: boolean;
  caption?: string;
  icon?: React.ReactNode;
  tone?: Tone;
  trend?: number[];
}

export function StatCard({
  label,
  value,
  change,
  higherIsBetter = true,
  caption,
  icon,
  tone = 1,
  trend,
}: StatCardProps) {
  const { chip, wash, edge } = tones[tone];
  const rising = change?.trim().startsWith('+');
  const good = rising === higherIsBetter;

  return (
    <div className="group rounded-card border-hairline bg-surface-card shadow-card hover:shadow-raised relative overflow-hidden border transition-shadow">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent ${wash}`}
      />
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-0.5 ${edge}`} />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-micro tracking-label text-ink-secondary font-medium uppercase">
            {label}
          </p>
          {icon && (
            <span className={`rounded-control grid size-8 shrink-0 place-items-center ${chip}`}>
              {icon}
            </span>
          )}
        </div>

        <p className="tabular font-display text-heading-sm tracking-display mt-3 font-semibold">
          {value}
        </p>

        <div className="mt-2 flex items-end justify-between gap-3">
          {(change || caption) && (
            <div className="text-micro flex flex-wrap items-center gap-x-2 gap-y-1">
              {change && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${
                    good ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'
                  }`}
                >
                  {rising ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  <span className="tabular">{change}</span>
                </span>
              )}
              {caption && <span className="text-ink-secondary">{caption}</span>}
            </div>
          )}
          {trend && <Sparkline points={trend} tone={tone} className="h-7 w-16 shrink-0" />}
        </div>
      </div>
    </div>
  );
}
