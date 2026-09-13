const WIDTH = 96;
const HEIGHT = 32;

interface SparklineProps {
  points: number[];
  tone: 1 | 2 | 3 | 7;
  className?: string;
}

export function Sparkline({ points, tone, className = '' }: SparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((value, i) => {
    const x = (i / (points.length - 1)) * WIDTH;
    const y = HEIGHT - ((value - min) / span) * (HEIGHT - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const id = `spark-${tone}-${points.length}-${Math.round(max)}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`text-series-${tone} ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${HEIGHT} ${coords.join(' ')} ${WIDTH},${HEIGHT}`}
        fill={`url(#${id})`}
      />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
