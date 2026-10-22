import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface ChecklistStep {
  label: string;
  done: boolean;
  to: string;
}

export function GetStartedChecklist({ steps }: { steps: ChecklistStep[] }) {
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  return (
    <Card className="mb-8">
      <p className="mb-4 text-sm font-medium text-ink">Get started</p>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done ? 'bg-brand-blue text-white' : 'border-2 border-line text-muted'
              }`}
            >
              {step.done ? <CheckIcon /> : i + 1}
            </span>
            {step.done ? (
              <span className="text-sm text-muted line-through">{step.label}</span>
            ) : (
              <Link to={step.to} className="text-sm font-medium text-ink hover:text-brand-blue">
                {step.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
