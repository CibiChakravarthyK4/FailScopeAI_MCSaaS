// The brand mark (CLAUDE.md 4.3): a flat blue ring with a notch and a single
// trace line leaving it - root cause traced back to its source. Reused as-is
// for the loading indicator (just add the spin) and the empty-state
// illustration (larger, static).
export function TraceRing({ size = 20, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={spinning ? 'animate-spin' : undefined}
    >
      <path
        d="M12 3a9 9 0 1 0 6.36 2.64"
        stroke="var(--iv-blue)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="12" r="2" fill="var(--iv-blue)" />
      <path d="M18.4 18.4l3.2 3.2" stroke="var(--iv-blue)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="22" cy="22" r="1.1" fill="var(--iv-blue)" />
    </svg>
  );
}

export function LoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <TraceRing size={16} spinning />
      {label}
    </div>
  );
}
