import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// The shell every logged-in page uses. Deliberately does not wrap children in
// PageContainer itself - each page applies PageContainer (and PageHeader)
// explicitly, so the container stays a conscious choice, not something
// buried a layer up that's easy to forget is the thing enforcing consistency.
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
