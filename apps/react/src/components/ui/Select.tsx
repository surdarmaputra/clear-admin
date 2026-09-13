import * as RSelect from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Field, describedBy } from './Field';

const controlClass =
  'w-full rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption ' +
  'text-ink-primary transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Select({
  id,
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  hint,
  error,
  required = false,
  disabled = false,
}: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <RSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RSelect.Trigger
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={
            controlClass +
            (error ? ' border-danger' : '') +
            ' flex items-center justify-between gap-2'
          }
        >
          <RSelect.Value placeholder={placeholder} />
          <RSelect.Icon>
            <ChevronDown size={16} className="text-ink-secondary shrink-0" />
          </RSelect.Icon>
        </RSelect.Trigger>

        <RSelect.Portal>
          <RSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card border border-hairline bg-surface-card shadow-raised"
          >
            <RSelect.ScrollUpButton className="flex h-6 items-center justify-center text-ink-secondary">
              <ChevronUp size={14} />
            </RSelect.ScrollUpButton>

            <RSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-default select-none items-center justify-between rounded-control px-3 py-2 text-caption text-ink-secondary outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-ink-primary"
                >
                  <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                  <RSelect.ItemIndicator>
                    <Check size={14} className="text-accent" />
                  </RSelect.ItemIndicator>
                </RSelect.Item>
              ))}
            </RSelect.Viewport>

            <RSelect.ScrollDownButton className="flex h-6 items-center justify-center text-ink-secondary">
              <ChevronDown size={14} />
            </RSelect.ScrollDownButton>
          </RSelect.Content>
        </RSelect.Portal>
      </RSelect.Root>
    </Field>
  );
}
