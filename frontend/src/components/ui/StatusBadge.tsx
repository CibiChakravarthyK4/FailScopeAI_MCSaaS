const COLORS: Record<string, string> = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-brand-blue-light text-brand-blue border-brand-blue/20',
  processing: 'bg-brand-blue-light text-brand-blue border-brand-blue/20',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  skipped: 'bg-gray-50 text-muted border-line',
};

export function StatusBadge({ status }: { status: string }) {
  const style = COLORS[status] ?? 'bg-gray-50 text-muted border-line';
  return (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
