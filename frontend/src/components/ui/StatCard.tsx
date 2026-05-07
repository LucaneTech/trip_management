import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('card p-6 flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink tracking-tight font-mono">{value}</p>
        </div>
        <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted-bg text-muted">
          {icon}
        </span>
      </div>
      {trend && (
        <p className="text-xs text-muted border-t border-border pt-3">{trend}</p>
      )}
    </div>
  );
}
