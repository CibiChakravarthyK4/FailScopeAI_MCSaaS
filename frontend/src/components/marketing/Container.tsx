import type { ReactNode } from 'react';

// The one width every marketing section must use - no section may set its
// own max-width. That inconsistency (each section picking a different
// max-w-*) was the root cause of the landing page's structural problems.
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1200px] px-6 ${className}`}>{children}</div>;
}
