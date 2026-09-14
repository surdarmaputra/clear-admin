import { lazy, Suspense, useEffect, useState } from 'react';
import type { ChartConfig } from '@/lib/charts';

const ChartImpl = lazy(() => import('./ChartImpl'));

interface ChartProps extends ChartConfig {
  title: string;
  description?: string;
  className?: string;
}

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function readPalette(slots: number[]) {
  return {
    series: slots.map((s) => token(`--color-series-${s}`)),
    surface: token('--color-surface-card'),
    ink: token('--color-ink-secondary'),
    hairline: token('--color-hairline'),
    tooltipBg: token('--color-ink-primary'),
  };
}

export function Chart({ title, description, height, className = '', ...config }: ChartProps) {
  const [palette, setPalette] = useState(() => readPalette(config.slots));

  useEffect(() => {
    setPalette(readPalette(config.slots));
    const obs = new MutationObserver(() => setPalette(readPalette(config.slots)));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, [config.slots]);

  return (
    <section
      className={`rounded-card border-hairline bg-surface-card shadow-card border p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-display text-subheading tracking-display font-semibold">{title}</h3>
        {description && <p className="text-caption text-ink-secondary mt-0.5">{description}</p>}
      </div>

      <div style={{ height }}>
        {palette.series.length > 0 ? (
          <Suspense
            fallback={
              <div className="rounded-control bg-surface-hover animate-pulse" style={{ height }} />
            }
          >
            <ChartImpl
              {...config}
              height={height}
              colors={palette.series}
              surface={palette.surface}
              ink={palette.ink}
              hairline={palette.hairline}
              tooltipBg={palette.tooltipBg}
            />
          </Suspense>
        ) : (
          <div className="rounded-control bg-surface-hover animate-pulse" style={{ height }} />
        )}
      </div>
    </section>
  );
}
