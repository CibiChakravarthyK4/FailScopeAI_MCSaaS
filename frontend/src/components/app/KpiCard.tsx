import type { JSX } from 'react';
import { Card } from '../ui/Card';

export function KpiCard({
  icon: Icon,
  label,
  value,
  helperText,
}: {
  icon: () => JSX.Element;
  label: string;
  value: string | number;
  helperText: string;
}) {
  return (
    <Card>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
        <Icon />
      </div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{helperText}</p>
    </Card>
  );
}
