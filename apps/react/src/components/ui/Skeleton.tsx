interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-control bg-surface-hover animate-pulse ${className}`}
    />
  );
}
