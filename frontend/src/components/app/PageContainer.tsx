import type { ReactNode } from 'react';

// The one width every authenticated page must use - no page may set its own
// max-width or offset. Mirrors marketing/Container.tsx's role for the public
// site; kept separate because the two contexts use different max-widths.
export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1280px] px-6 py-8 ${className}`}>{children}</div>;
}
