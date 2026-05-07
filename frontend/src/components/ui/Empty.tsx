import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Empty({
  title = 'Aucun résultat',
  description = 'Il n\'y a rien à afficher ici pour le moment.',
  action,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Inbox className="h-10 w-10 text-border mb-4" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
