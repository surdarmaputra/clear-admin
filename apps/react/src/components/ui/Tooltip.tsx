import * as RTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  text: string;
  placement?: Placement;
  children: ReactNode;
}

export function Tooltip({ text, placement = 'top', children }: TooltipProps) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={placement}
          sideOffset={6}
          className="z-40 max-w-56 rounded-control bg-ink-primary px-2 py-1 text-micro text-surface-page"
        >
          {text}
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
