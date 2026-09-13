import type { Chart as ChartJS, ScriptableContext } from 'chart.js';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { ChartConfig, Series } from '@/lib/charts';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

interface ChartImplProps extends ChartConfig {
  height: number;
  colors: string[];
}

const font = { family: 'var(--font-sans)', size: 12 } as const;

const fade = (hex: string, alpha: number) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

const areaFill = (colour: string) => (context: ScriptableContext<'line'>) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return 'transparent';
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, fade(colour, 0.22));
  gradient.addColorStop(1, fade(colour, 0));
  return gradient;
};

const axisMoney = (value: number, prefix?: string) =>
  `${prefix ?? ''}${value >= 10000 ? `${Math.round(value / 1000)}K` : value.toLocaleString('en-US')}`;

const money = (value: number, prefix?: string) => `${prefix ?? ''}${value.toLocaleString('en-US')}`;

function buildLegendLabels(chart: ChartJS) {
  return chart.data.datasets.map((dataset, index) => ({
    text: dataset.label ?? '',
    fillStyle: (dataset.borderColor ?? dataset.backgroundColor) as string,
    strokeStyle: (dataset.borderColor ?? dataset.backgroundColor) as string,
    lineWidth: 0,
    hidden: !chart.isDatasetVisible(index),
    datasetIndex: index,
  }));
}

export default function ChartImpl({
  type,
  series,
  categories,
  labels,
  colors,
  valuePrefix,
}: ChartImplProps) {
  const surface = 'var(--color-surface-card)';
  const ink = 'var(--color-ink-secondary)';
  const hairline = 'var(--color-hairline)';

  const tooltipBase = {
    backgroundColor: 'var(--color-ink-primary)',
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
  };

  const legendBase = {
    position: 'bottom' as const,
    align: 'start' as const,
    labels: {
      color: ink,
      font,
      boxWidth: 8,
      boxHeight: 8,
      usePointStyle: true,
      pointStyle: 'circle' as const,
    },
  };

  if (type === 'donut') {
    const nums = series as number[];
    return (
      <Doughnut
        data={{
          labels: labels ?? nums.map((_, i) => `Series ${i + 1}`),
          datasets: [
            {
              data: nums,
              backgroundColor: colors,
              borderColor: surface,
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 300 },
          cutout: '72%',
          plugins: {
            legend: { ...legendBase, display: true, position: 'right' as const },
            tooltip: {
              ...tooltipBase,
              callbacks: {
                label: (item) => ` ${item.label}: ${money(item.parsed, valuePrefix)}`,
              },
            },
          },
        }}
      />
    );
  }

  const seriesArr = series as Series[];
  const showLegend = seriesArr.length > 1;

  const scales = {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: ink, font, maxRotation: 0, autoSkipPadding: 12 },
    },
    y: {
      grid: { color: hairline },
      border: { display: false },
      ticks: {
        color: ink,
        font,
        maxTicksLimit: 6,
        callback(value: string | number) {
          return axisMoney(Number(value), valuePrefix);
        },
      },
    },
  } as const;

  const tooltipCallbacks = {
    label: (item: { dataset: { label?: string }; parsed: { y: number | null } }) =>
      ` ${item.dataset.label ?? ''}: ${money(item.parsed.y ?? 0, valuePrefix)}`,
  };

  const legendWithOverride = {
    ...legendBase,
    display: showLegend,
    labels: { ...legendBase.labels, generateLabels: buildLegendLabels },
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index' as const, intersect: false },
    scales,
    plugins: {
      legend: legendWithOverride,
      tooltip: { ...tooltipBase, callbacks: tooltipCallbacks },
    },
  };

  if (type === 'line') {
    return (
      <Line
        data={{
          labels: categories ?? [],
          datasets: seriesArr.map((s, i) => ({
            label: s.name,
            data: s.data,
            borderColor: colors[i],
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
          })),
        }}
        options={baseOptions}
      />
    );
  }

  if (type === 'area') {
    return (
      <Line
        data={{
          labels: categories ?? [],
          datasets: seriesArr.map((s, i) => ({
            label: s.name,
            data: s.data,
            borderColor: colors[i],
            backgroundColor: areaFill(colors[i] ?? ''),
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
          })),
        }}
        options={baseOptions}
      />
    );
  }

  return (
    <Bar
      data={{
        labels: categories ?? [],
        datasets: seriesArr.map((s, i) => ({
          label: s.name,
          data: s.data,
          backgroundColor: colors[i],
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.78,
        })),
      }}
      options={baseOptions}
    />
  );
}
