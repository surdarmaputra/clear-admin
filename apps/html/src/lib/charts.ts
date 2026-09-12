import type { Chart, ChartConfiguration, ChartOptions, ScriptableContext } from 'chart.js';

export interface Series {
  name: string;
  data: number[];
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'donut';
  /** Axis series for line/area/bar; a flat number list for donut. */
  series: Series[] | number[];
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

/** Everything that changes when the theme does. Dark is re-derived, never flipped. */
const palette = (config: ChartConfig) => ({
  series: config.slots.map((slot) => token(`--color-series-${slot}`)),
  ink: token('--color-ink-secondary'),
  hairline: token('--color-hairline'),
  surface: token('--color-surface-card'),
});

const phone = () => window.matchMedia('(max-width: 639px)').matches;

/** Hex alpha suffix — the fill under an area line, at the same hue as the line. */
const fade = (hex: string, alpha: number) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

/**
 * The fill fades to nothing at the baseline, so a stack of area cards does not
 * read as a wall of colour. Scriptable because the gradient needs the plot box,
 * which does not exist until the first layout pass.
 */
const areaFill = (colour: string) => (context: ScriptableContext<'line'>) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return 'transparent';

  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, fade(colour, 0.22));
  gradient.addColorStop(1, fade(colour, 0));
  return gradient;
};

function buildData(config: ChartConfig, colours: string[], surface: string) {
  if (config.type === 'donut') {
    return {
      labels: config.labels,
      datasets: [
        {
          data: config.series as number[],
          backgroundColor: colours,
          // A 2px gap between slices, drawn in the card colour.
          borderColor: surface,
          borderWidth: 2,
        },
      ],
    };
  }

  const series = config.series as Series[];
  return {
    labels: config.categories,
    datasets: series.map((entry, index) => ({
      label: entry.name,
      data: entry.data,
      borderColor: colours[index],
      backgroundColor:
        config.type === 'area'
          ? areaFill(colours[index])
          : config.type === 'bar'
            ? colours[index]
            : 'transparent',
      fill: config.type === 'area',
      borderWidth: config.type === 'bar' ? 0 : 2,
      tension: 0.35,
      // Invisible until hovered, then a target bigger than the mark.
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBorderWidth: 2,
      borderRadius: config.type === 'bar' ? 4 : 0,
      borderSkipped: false,
      barPercentage: 0.7,
      categoryPercentage: 0.78,
    })),
  };
}

function buildOptions(config: ChartConfig): ChartOptions {
  const { ink, hairline, surface } = palette(config);
  const prefix = config.valuePrefix ?? '';
  const money = (value: number) => `${prefix}${value.toLocaleString('en-US')}`;
  // Axis labels go compact ($71K) so the plot keeps its width on a phone; the
  // tooltip still carries the exact figure.
  const axisMoney = (value: number) =>
    `${prefix}${value >= 10000 ? `${Math.round(value / 1000)}K` : value.toLocaleString('en-US')}`;

  const multiSeries = config.type !== 'donut' && (config.series as Series[]).length > 1;
  const font = { family: token('--font-sans'), size: 12 };

  const base: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        // A single-series chart needs no legend — the card title names it.
        display: multiSeries,
        position: 'bottom',
        align: 'start',
        labels: {
          color: ink,
          font,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: token('--color-ink-primary'),
        titleColor: surface,
        bodyColor: surface,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        titleFont: font,
        bodyFont: font,
        callbacks: {
          label: (item) => ` ${item.dataset.label ?? item.label}: ${money(item.parsed.y ?? 0)}`,
        },
      },
    },
  };

  if (config.type === 'donut') {
    // `cutout` lives on the doughnut options type only, so the branch is cast
    // rather than annotated — annotating it fights the plugin generics.
    return {
      ...base,
      cutout: phone() ? '68%' : '72%',
      plugins: {
        ...base.plugins,
        legend: {
          ...base.plugins?.legend,
          // Three light-mode series sit under 3:1 against the card, so the
          // slices carry labels rather than relying on the fill alone.
          display: true,
          position: phone() ? 'bottom' : 'right',
        },
        tooltip: {
          ...base.plugins?.tooltip,
          callbacks: {
            label: (item: { label: string; parsed: number }) =>
              ` ${item.label}: ${money(item.parsed)}`,
          },
        },
      },
    } as ChartOptions;
  }

  const indexAxis = config.type === 'bar' && config.horizontal ? ('y' as const) : ('x' as const);

  return {
    ...base,
    indexAxis,
    plugins: {
      ...base.plugins,
      legend: {
        ...base.plugins?.legend,
        labels: {
          ...base.plugins?.legend?.labels,
          // A line dataset has no fill, so the default swatch comes out hollow.
          // It has to carry the series colour, not outline it.
          generateLabels: (chart) =>
            chart.data.datasets.map((dataset, index) => ({
              text: dataset.label ?? '',
              fillStyle: (dataset.borderColor ?? dataset.backgroundColor) as string,
              strokeStyle: (dataset.borderColor ?? dataset.backgroundColor) as string,
              lineWidth: 0,
              hidden: !chart.isDatasetVisible(index),
              datasetIndex: index,
            })),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: ink,
          font,
          // Twelve month labels collide at phone width even unrotated. Thin
          // them rather than rotating into a clip.
          maxTicksLimit: phone() ? 5 : undefined,
          maxRotation: 0,
          autoSkipPadding: 12,
          callback(value) {
            const label = this.getLabelForValue(value as number);
            return indexAxis === 'y' ? axisMoney(Number(label)) : label;
          },
        },
      },
      y: {
        grid: { color: hairline },
        border: { display: false },
        ticks: {
          color: ink,
          font,
          // Six gridlines is the most a 260px card reads as structure rather
          // than as noise.
          maxTicksLimit: 6,
          callback(value) {
            return indexAxis === 'y'
              ? this.getLabelForValue(value as number)
              : axisMoney(Number(value));
          },
        },
      },
    },
  };
}

/** Repaints a live chart against the current theme without rebuilding it. */
function applyTheme(chart: Chart, config: ChartConfig) {
  const { series, ink, hairline, surface } = palette(config);

  if (config.type === 'donut') {
    chart.data.datasets[0].backgroundColor = series;
    chart.data.datasets[0].borderColor = surface;
  } else {
    chart.data.datasets.forEach((dataset, index) => {
      dataset.borderColor = series[index];
      dataset.backgroundColor =
        config.type === 'area'
          ? areaFill(series[index])
          : config.type === 'bar'
            ? series[index]
            : 'transparent';
    });
  }

  const options = chart.options as ChartOptions;
  if (options.plugins?.legend?.labels) options.plugins.legend.labels.color = ink;
  if (options.plugins?.tooltip) {
    options.plugins.tooltip.backgroundColor = token('--color-ink-primary');
    options.plugins.tooltip.titleColor = surface;
    options.plugins.tooltip.bodyColor = surface;
  }
  for (const axis of ['x', 'y'] as const) {
    const scale = options.scales?.[axis];
    if (!scale) continue;
    if (scale.ticks) scale.ticks.color = ink;
    if (axis === 'y' && scale.grid) scale.grid.color = hairline;
  }

  chart.update('none');
  return series;
}

/** Mounts every `[data-chart]` on the page and keeps them in step with the theme. */
export async function mountCharts() {
  const roots = document.querySelectorAll<HTMLElement>('[data-chart]');
  if (roots.length === 0) return;

  // Charts are the heaviest thing the bundle pulls in, so the library is
  // fetched after first paint — the skeleton already holds the layout — and
  // pages without a chart never download it at all.
  // Named imports only: the whole point of the swap is that the controllers
  // nothing draws never reach the bundle.
  const {
    Chart: ChartJS,
    LineController,
    BarController,
    DoughnutController,
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
  } = await import('chart.js');

  ChartJS.register(
    LineController,
    BarController,
    DoughnutController,
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
  );

  for (const root of roots) {
    const canvas = root.querySelector<HTMLCanvasElement>('canvas[data-chart-canvas]');
    const raw = root.querySelector('[data-chart-config]')?.textContent;
    if (!canvas || !raw) continue;

    const config: ChartConfig = JSON.parse(raw);
    const { series, surface } = palette(config);

    try {
      const chart = new ChartJS(canvas, {
        type: config.type === 'area' ? 'line' : config.type === 'donut' ? 'doughnut' : config.type,
        data: buildData(config, series, surface),
        options: buildOptions(config),
      } as ChartConfiguration);

      root.querySelector('[data-chart-skeleton]')?.remove();
      // A canvas has no DOM to inspect, so the colours actually applied are
      // published here — it is what the theme test reads.
      root.dataset.chartColors = series.join(',');

      new MutationObserver(() => {
        root.dataset.chartColors = applyTheme(chart, config).join(',');
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    } catch {
      root.querySelector('[data-chart-skeleton]')?.remove();
      canvas.hidden = true;
      root.querySelector<HTMLElement>('[data-chart-error]')?.removeAttribute('hidden');
    }
  }
}
