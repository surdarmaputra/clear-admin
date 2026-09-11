import type { ApexOptions } from 'apexcharts';

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'donut';
  /** Axis series for line/area/bar; a flat number list for donut. */
  series: NonNullable<ApexOptions['series']>;
  categories?: string[];
  /** Series token slots, in fixed order. Never cycled; an extra series is a redesign. */
  slots: number[];
  height: number;
  labels?: string[];
  valuePrefix?: string;
  horizontal?: boolean;
}

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const isDark = () => document.documentElement.classList.contains('dark');

/** Everything that changes when the theme does. Dark is re-derived, never flipped. */
function themed(config: ChartConfig) {
  const surface = token('--color-surface-card');
  const ink = token('--color-ink-secondary');

  return {
    colors: config.slots.map((slot) => token(`--color-series-${slot}`)),
    grid: { borderColor: token('--color-hairline') },
    tooltip: { theme: isDark() ? ('dark' as const) : ('light' as const) },
    xaxis: { labels: { style: { colors: ink } } },
    yaxis: { labels: { style: { colors: ink } } },
    legend: { labels: { colors: ink } },
    // The 2px gap between adjacent fills is drawn in the surface colour, so it
    // has to be recomputed alongside the series — but only where there are
    // fills to separate. On a line chart it would paint the line invisible.
    ...(config.type === 'bar' || config.type === 'donut' ? { stroke: { colors: [surface] } } : {}),
  };
}

function buildOptions(config: ChartConfig): ApexOptions {
  const { type, series, categories, height, labels, valuePrefix = '' } = config;
  const money = (v: number) => `${valuePrefix}${v.toLocaleString('en-US')}`;
  const multiSeries = Array.isArray(series) && series.length > 1;
  const theme = themed(config);

  const base = {
    chart: {
      type,
      height,
      width: '100%',
      fontFamily: token('--font-sans'),
      background: 'transparent',
      toolbar: { show: false },
      parentHeightOffset: 0,
      animations: { speed: 300 },
    },
    series,
    colors: theme.colors,
    // A number on every point is noise; the tooltip carries the detail instead.
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.grid.borderColor,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      padding: { left: 4, right: 4 },
    },
    legend: {
      show: multiSeries,
      position: 'bottom' as const,
      horizontalAlign: 'left' as const,
      fontSize: '12px',
      markers: { size: 5 },
      itemMargin: { horizontal: 10 },
      labels: theme.legend.labels,
    },
    tooltip: { theme: theme.tooltip.theme, y: { formatter: money } },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.xaxis.labels.style.colors, fontSize: '12px' } },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.yaxis.labels.style.colors, fontSize: '12px' },
        formatter: money,
      },
    },
  };

  if (type === 'line' || type === 'area') {
    return {
      ...base,
      stroke: { width: 2, curve: 'smooth' as const, lineCap: 'round' as const },
      // Invisible until hovered, then a 10px target — bigger than the mark.
      markers: { size: 0, strokeWidth: 2, hover: { size: 5 } },
      fill:
        type === 'area'
          ? {
              type: 'gradient',
              gradient: { shadeIntensity: 0, opacityFrom: 0.22, opacityTo: 0, stops: [0, 100] },
            }
          : // Full opacity: the palette was validated at these exact values, and
            // Apex otherwise paints lines at 0.85.
            { type: 'solid', opacity: 1 },
    };
  }

  if (type === 'bar') {
    return {
      ...base,
      plotOptions: {
        bar: {
          horizontal: config.horizontal ?? false,
          columnWidth: '55%',
          borderRadius: 4,
          // Rounded at the data end only — the baseline end stays square so the
          // bar still reads as anchored to zero.
          borderRadiusApplication: 'end' as const,
        },
      },
      stroke: { show: true, width: 2, colors: [token('--color-surface-card')] },
    };
  }

  return {
    ...base,
    labels,
    stroke: { width: 2, colors: [token('--color-surface-card')] },
    plotOptions: { pie: { donut: { size: '72%' } } },
    // Three of the light-mode series sit under 3:1 against white, so the slices
    // carry visible labels rather than relying on the fill alone.
    legend: { ...base.legend, show: true, position: 'right' as const },
    xaxis: {},
    yaxis: {},
    tooltip: { theme: theme.tooltip.theme, y: { formatter: money } },
  };
}

/** Mounts every `[data-chart]` on the page and keeps them in step with the theme. */
export async function mountCharts() {
  const roots = document.querySelectorAll<HTMLElement>('[data-chart]');
  if (roots.length === 0) return;

  // ApexCharts is by far the heaviest thing the bundle pulls in, so it is
  // fetched after first paint — the skeleton already holds the layout — and
  // pages without a chart never download it at all.
  const { default: ApexCharts } = await import('apexcharts');

  for (const root of roots) {
    const canvas = root.querySelector<HTMLElement>('[data-chart-canvas]');
    const raw = root.querySelector('[data-chart-config]')?.textContent;
    if (!canvas || !raw) continue;

    const config: ChartConfig = JSON.parse(raw);

    try {
      const chart = new ApexCharts(canvas, buildOptions(config));
      chart.render();
      root.querySelector('[data-chart-skeleton]')?.remove();

      new MutationObserver(() => chart.updateOptions(themed(config), false, false)).observe(
        document.documentElement,
        { attributes: true, attributeFilter: ['class'] },
      );
    } catch {
      root.querySelector('[data-chart-skeleton]')?.remove();
      canvas.hidden = true;
      root.querySelector<HTMLElement>('[data-chart-error]')?.removeAttribute('hidden');
    }
  }
}
