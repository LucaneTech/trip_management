import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className, padding = true, header, footer }: CardProps) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      {header && (
        <div className="px-5 py-4 border-b border-border">{header}</div>
      )}
      <div className={cn(padding && 'p-5')}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-border bg-paper">{footer}</div>
      )}
    </div>
  );
}
