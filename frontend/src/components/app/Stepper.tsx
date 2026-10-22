function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Stepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol className="mb-8 flex items-center">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < currentIndex
                  ? 'bg-brand-blue text-white'
                  : i === currentIndex
                    ? 'border-2 border-brand-blue text-brand-blue'
                    : 'border-2 border-line text-muted'
              }`}
            >
              {i < currentIndex ? <CheckIcon /> : i + 1}
            </span>
            <span
              className={`hidden whitespace-nowrap text-sm font-medium sm:inline ${
                i <= currentIndex ? 'text-ink' : 'text-muted'
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-2 h-px flex-1 sm:mx-3 ${i < currentIndex ? 'bg-brand-blue' : 'bg-line'}`} />
          )}
        </li>
      ))}
    </ol>
  );
}
