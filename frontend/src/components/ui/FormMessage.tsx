// Errors, warnings and success are told apart by icon and label only (CLAUDE.md
// 4.4) - all three render in the same deep-blue text with a left border bar,
// never red/amber/green.
import type { ReactNode } from 'react';

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
      <path
        d="M12 3L2 21h20L12 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = { error: AlertIcon, warning: AlertIcon, success: CheckCircleIcon };

export function FormMessage({
  variant = 'error',
  children,
}: {
  variant?: 'error' | 'warning' | 'success';
  children: ReactNode;
}) {
  const Icon = ICONS[variant];
  return (
    <div className="flex items-start gap-2 border-l-2 border-iv-blue-deep bg-iv-blue-50 px-3 py-2 text-sm text-iv-blue-deep">
      <Icon />
      <span>{children}</span>
    </div>
  );
}
