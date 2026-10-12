import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-lg font-semibold text-ink">
            FailScope <span className="text-brand-blue">AI</span>
          </Link>
          {user && (
            <>
              <Link to="/runs" className="text-sm font-medium text-muted hover:text-ink">
                Runs
              </Link>
              <Link to="/groups" className="text-sm font-medium text-muted hover:text-ink">
                Groups
              </Link>
              <Link to="/review-queue" className="text-sm font-medium text-muted hover:text-ink">
                Review queue
              </Link>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-sm font-medium text-muted hover:text-ink">
              Settings
            </Link>
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
