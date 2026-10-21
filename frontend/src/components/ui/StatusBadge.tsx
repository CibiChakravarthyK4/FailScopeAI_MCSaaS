// Every status is told apart by icon + label only (CLAUDE.md 4.4) - never by
// color alone, and never red or green. Flat blue/white/neutral only.

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function HalfIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
    </svg>
  );
}

const STYLES: Record<string, { icon: () => JSX.Element; className: string }> = {
  queued: { icon: ClockIcon, className: 'border border-iv-border bg-white text-iv-text-2' },
  pending: { icon: ClockIcon, className: 'border border-iv-border bg-white text-iv-text-2' },
  processing: { icon: SpinnerIcon, className: 'border border-iv-blue-100 bg-iv-blue-50 text-iv-blue' },
  completed: { icon: CheckIcon, className: 'border border-iv-blue bg-iv-blue text-white' },
  failed: { icon: CrossIcon, className: 'border border-iv-blue-deep bg-white text-iv-blue-deep' },
  error: { icon: CrossIcon, className: 'border border-iv-blue-deep bg-white text-iv-blue-deep' },
  partial: { icon: HalfIcon, className: 'border border-iv-blue-100 bg-iv-blue-50 text-iv-blue' },
  skipped: { icon: DashIcon, className: 'border border-iv-border bg-white text-iv-text-2' },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? { icon: DashIcon, className: 'border border-iv-border bg-white text-iv-text-2' };
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium capitalize ${style.className}`}
    >
      <Icon />
      {status}
    </span>
  );
}
