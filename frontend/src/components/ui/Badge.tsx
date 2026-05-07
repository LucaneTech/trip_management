import React from 'react';
import { cn } from '../../lib/utils';
import type { BookingStatus, PaymentStatus } from '../../types';

type BadgeVariant =
  | 'default'
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'admin'
  | 'agent'
  | 'client';

const variants: Record<BadgeVariant, string> = {
  default:   'bg-muted-bg text-muted',
  pending:   'bg-status-pending-bg text-status-pending',
  confirmed: 'bg-status-confirmed-bg text-status-confirmed',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled',
  completed: 'bg-status-completed-bg text-status-completed',
  failed:    'bg-status-failed-bg text-status-failed',
  admin:     'bg-ink text-white',
  agent:     'bg-muted-bg text-ink',
  client:    'bg-muted-bg text-muted',
};

const labels: Record<string, string> = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Complété',
  failed:    'Échoué',
  admin:     'Admin',
  agent:     'Agent',
  client:    'Client',
};

interface BadgeProps {
  variant?: BadgeVariant;
  value?: BookingStatus | PaymentStatus | string;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant, value, children, className }: BadgeProps) {
  const v = variant ?? (value as BadgeVariant) ?? 'default';
  const label = children ?? (value ? (labels[value] ?? value) : '');

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide',
        variants[v] ?? variants.default,
        className
      )}
    >
      {label}
    </span>
  );
}
