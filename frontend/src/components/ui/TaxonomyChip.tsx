import type { FailureCategory } from '../../types';

// The 6 taxonomy categories (CLAUDE.md 4.3) are told apart by icon + label,
// with filled/outlined/dashed border as a secondary cue - never by color.

function BugIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="10" height="12" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7V4M9 4l1.5 2M15 4l-1.5 2M4 12h3M17 12h3M5 18l2.5-2M19 18l-2.5-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 9l3 3-3 3M13 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 18a4 4 0 0 1-.6-7.96A5 5 0 0 1 16.3 8.1 4.5 4.5 0 0 1 17.5 18H7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 16v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2" />
      <path d="M10 9a2 2 0 1 1 3 1.7c-.6.4-1 1-1 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

const CONFIG: Record<FailureCategory, { icon: () => JSX.Element; label: string; className: string }> = {
  application_bug: {
    icon: BugIcon,
    label: 'Application bug',
    className: 'border border-iv-blue bg-iv-blue text-white',
  },
  script_issue: {
    icon: TerminalIcon,
    label: 'Script issue',
    className: 'border border-iv-blue text-iv-blue bg-white',
  },
  data_issue: {
    icon: DatabaseIcon,
    label: 'Data issue',
    className: 'border border-iv-blue text-iv-blue bg-white',
  },
  environment: {
    icon: CloudIcon,
    label: 'Environment',
    className: 'border border-dashed border-iv-blue-deep text-iv-blue-deep bg-white',
  },
  integration: {
    icon: PlugIcon,
    label: 'Integration',
    className: 'border border-dashed border-iv-blue-deep text-iv-blue-deep bg-white',
  },
  unknown: {
    icon: QuestionIcon,
    label: 'Unknown',
    className: 'border border-dashed border-iv-border text-iv-text-2 bg-white',
  },
};

export function TaxonomyChip({ category }: { category: FailureCategory }) {
  const { icon: Icon, label, className } = CONFIG[category];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      <Icon />
      {label}
    </span>
  );
}
