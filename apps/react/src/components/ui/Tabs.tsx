import * as RTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className = '' }: TabsProps) {
  return (
    <RTabs.Root defaultValue={defaultValue ?? tabs[0]?.id} className={className}>
      <RTabs.List className="flex gap-1 overflow-x-auto border-b border-hairline">
        {tabs.map((tab) => (
          <RTabs.Trigger
            key={tab.id}
            value={tab.id}
            className="-mb-px shrink-0 border-b-2 px-3 py-2 text-caption font-medium transition-colors border-transparent text-ink-secondary data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            {tab.label}
          </RTabs.Trigger>
        ))}
      </RTabs.List>

      {tabs.map((tab) => (
        <RTabs.Content key={tab.id} value={tab.id} className="pt-4">
          {tab.content}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  );
}
