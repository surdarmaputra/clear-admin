import * as RSwitch from '@radix-ui/react-switch';

interface SwitchProps {
  id: string;
  label: string;
  hint?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: SwitchProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-caption cursor-pointer font-medium">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-micro text-ink-secondary">
            {hint}
          </p>
        )}
      </div>

      <RSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="border-hairline data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RSwitch.Thumb className="bg-paper shadow-card block size-5 rounded-full transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
      </RSwitch.Root>
    </div>
  );
}
