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
      <RTabs.List className="border-hairline flex gap-1 overflow-x-auto border-b">
        {tabs.map((tab) => (
          <RTabs.Trigger
            key={tab.id}
            value={tab.id}
            className="text-caption text-ink-secondary data-[state=active]:border-accent data-[state=active]:text-accent -mb-px shrink-0 border-b-2 border-transparent px-3 py-2 font-medium transition-colors"
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
