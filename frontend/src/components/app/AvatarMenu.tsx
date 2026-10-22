import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AvatarMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = (user.full_name || user.email).charAt(0).toUpperCase();

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-md border border-line bg-white shadow-sm">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{user.full_name || user.email}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <span className="mt-2 inline-block rounded-full border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium capitalize text-brand-blue">
              {user.role}
            </span>
          </div>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-ink hover:bg-brand-blue-light"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-brand-blue-light"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
