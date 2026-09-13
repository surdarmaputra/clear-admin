const sizes = {
  sm: 'size-7 text-micro',
  md: 'size-9 text-caption',
  lg: 'size-12 text-body',
};

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <span
      title={name}
      className={`bg-surface-hover text-ink-secondary grid shrink-0 place-items-center rounded-full font-medium ${sizes[size]} ${className}`}
    >
      <span aria-hidden="true">{initials}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
