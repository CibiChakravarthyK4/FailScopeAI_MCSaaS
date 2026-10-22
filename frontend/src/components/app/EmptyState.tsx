import type { ReactNode } from 'react';
import { TraceRing } from '../ui/TraceRing';

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-white px-6 py-16 text-center">
      <TraceRing size={40} />
      <p className="mt-4 max-w-sm text-sm text-muted">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
