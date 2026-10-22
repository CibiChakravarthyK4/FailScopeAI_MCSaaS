import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TraceRing } from '../ui/TraceRing';

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="12" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="15" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function RunsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5v14l11-7-11-7Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function GroupsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="14" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4 20c.5-3 2.3-5 5-5s4.5 2 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M19.4 13a7.4 7.4 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-1.7-1l-.3-2.5H9.9l-.3 2.5a7.5 7.5 0 0 0-1.7 1l-2.3-.9-2 3.4L5.6 11a7.4 7.4 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 1.7 1l.3 2.5h4.2l.3-2.5a7.5 7.5 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/runs', label: 'Runs', icon: RunsIcon },
  { to: '/groups', label: 'Groups', icon: GroupsIcon },
  { to: '/review-queue', label: 'Review queue', icon: ReviewIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: () => JSX.Element }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      title={label}
      className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'border-brand-blue bg-brand-blue-light text-brand-blue'
          : 'border-transparent text-muted hover:bg-brand-blue-light hover:text-ink'
      }`}
    >
      <span className="flex-shrink-0">
        <Icon />
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-16 flex-shrink-0 flex-col border-r border-line bg-white lg:w-60">
      <Link
        to="/dashboard"
        className="flex h-16 items-center justify-center gap-2 border-b border-line px-2 lg:justify-start lg:px-5"
      >
        <TraceRing size={22} />
        <span className="hidden text-base font-semibold text-ink lg:inline">
          RootTrace <span className="text-brand-blue">Ivory</span>
        </span>
      </Link>

      {user && (
        <div className="hidden border-b border-line px-4 py-3 lg:block">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Workspace</p>
          <p className="truncate text-sm font-medium text-ink">{user.tenant_name}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-2 py-4 lg:px-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="hidden border-t border-line px-4 py-3 text-xs text-muted lg:block">
        <a href="#" className="hover:text-ink">
          Help
        </a>
        <p className="mt-1">v1.0.0</p>
      </div>
    </aside>
  );
}
