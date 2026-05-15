import React from 'react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  accentClass?: string;
}

export function DashboardTabs({
  tabs,
  active,
  onChange,
  accentClass = 'border-indigo-600 text-indigo-700',
}: DashboardTabsProps) {
  return (
    <div className="border-b border-border flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            active === tab.id
              ? `${accentClass} border-current`
              : 'border-transparent text-muted hover:text-ink hover:border-border',
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
