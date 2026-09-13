import {
  Chart as ChartJS,
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

ChartJS.register(
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

const tickFont = { size: 12 } as const;
const legendLabels = {
  color: 'var(--color-ink-secondary)',
  font: tickFont,
  boxWidth: 10,
  boxHeight: 10,
} as const;

function fmt(value: unknown, prefix?: string) {
  return `${prefix ?? ''}${(value as number).toLocaleString('en-US')}`;
}

export default function ChartImpl({ type, series, categories, labels, height, colors, valuePrefix }: ChartImplProps) {
  if (type === 'donut') {
    const nums = series as number[];
    return (
      <Doughnut
        data={{
          labels: nums.map((_, i) => labels?.[i] ?? `Series ${i + 1}`),
          datasets: [{
            data: nums,
            backgroundColor: colors,
            borderColor: 'var(--color-surface-card)',
            borderWidth: 2,
            hoverOffset: 4,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
          plugins: {
            legend: { labels: legendLabels },
            tooltip: {
              callbacks: {
                label: (item) => `${item.label ?? ''}: ${fmt(item.raw, valuePrefix)}`,
              },
            },
          },
        }}
      />
    );
  }

  const seriesArr = series as Series[];
  const showLegend = seriesArr.length > 1;

  const axisOptions = {
    x: {
      ticks: { color: 'var(--color-ink-secondary)', font: tickFont },
      grid: { color: 'var(--color-hairline)' },
      border: { display: false },
    },
    y: {
      ticks: {
        color: 'var(--color-ink-secondary)',
        font: tickFont,
        callback: (v: string | number) => fmt(v, valuePrefix),
      },
      grid: { color: 'var(--color-hairline)' },
      border: { display: false },
    },
  } as const;

  const tooltipCallbacks = {
    label: (item: { dataset: { label?: string }; raw: unknown }) =>
      `${item.dataset.label ?? ''}: ${fmt(item.raw, valuePrefix)}`,
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
            backgroundColor: colors[i],
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: showLegend, labels: legendLabels },
            tooltip: { callbacks: tooltipCallbacks },
          },
          scales: axisOptions,
        }}
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
            backgroundColor: `${colors[i]}1e`,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: showLegend, labels: legendLabels },
            tooltip: { callbacks: tooltipCallbacks },
          },
          scales: axisOptions,
        }}
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
          borderRadius: 4,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: showLegend, labels: legendLabels },
          tooltip: { callbacks: tooltipCallbacks },
        },
        scales: axisOptions,
      }}
    />
  );
}
