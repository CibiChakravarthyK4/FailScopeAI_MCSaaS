import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { TraceRing } from '../ui/TraceRing';
import { SearchBar } from './SearchBar';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        isActive ? 'text-brand-blue' : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <TraceRing size={22} />
          RootTrace <span className="text-brand-blue">Ivory</span>
        </Link>
        {user && <SearchBar />}
        {user && (
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted">{user.email}</span>
            <Button variant="secondary" className="w-auto px-4 py-2" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </div>
      {user && (
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 pb-3">
          <NavLink to="/runs">Runs</NavLink>
          <NavLink to="/groups">Groups</NavLink>
          <NavLink to="/review-queue">Review queue</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </div>
      )}
    </header>
  );
}
