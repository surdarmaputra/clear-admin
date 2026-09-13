import { lazy, Suspense, useEffect, useState } from 'react';
import type { ChartConfig } from '@/lib/charts';

const ChartImpl = lazy(() => import('./ChartImpl'));

interface ChartProps extends ChartConfig {
  title: string;
  description?: string;
  className?: string;
}

export function Chart({ title, description, height, className = '', ...config }: ChartProps) {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors(config.slots.map((s) => style.getPropertyValue(`--color-series-${s}`).trim()));
  }, [config.slots]);

  return (
    <section
      className={`rounded-card border border-hairline bg-surface-card p-5 shadow-card ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-display text-subheading font-semibold tracking-display">{title}</h3>
        {description && <p className="mt-0.5 text-caption text-ink-secondary">{description}</p>}
      </div>

      <div style={{ height }}>
        {colors.length > 0 ? (
          <Suspense
            fallback={
              <div
                className="animate-pulse rounded-control bg-surface-hover"
                style={{ height }}
              />
            }
          >
            <ChartImpl {...config} height={height} colors={colors} />
          </Suspense>
        ) : (
          <div className="animate-pulse rounded-control bg-surface-hover" style={{ height }} />
        )}
      </div>
    </section>
  );
}
