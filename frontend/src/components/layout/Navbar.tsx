import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-lg font-semibold text-ink">
            FailScope <span className="text-brand-blue">AI</span>
          </Link>
          {user && (
            <nav className="flex items-center gap-6">
              <NavLink to="/runs">Runs</NavLink>
              <NavLink to="/groups">Groups</NavLink>
              <NavLink to="/review-queue">Review queue</NavLink>
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <NavLink to="/settings">Settings</NavLink>
            <span className="text-sm text-muted">{user.email}</span>
            <Button variant="secondary" className="w-auto px-4 py-2" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
