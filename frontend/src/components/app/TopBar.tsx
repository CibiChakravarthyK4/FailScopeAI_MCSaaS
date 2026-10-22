import { SearchBar } from '../layout/SearchBar';
import { AvatarMenu } from './AvatarMenu';

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:gap-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <SearchBar />
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-brand-blue-light hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
      >
        <BellIcon />
      </button>
      <AvatarMenu />
    </header>
  );
}
