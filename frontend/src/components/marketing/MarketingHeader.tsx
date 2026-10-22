import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { TraceRing } from '../ui/TraceRing';
import { Container } from './Container';

const NAV_LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#security', label: 'Security' },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-10 h-16 border-b border-line bg-white">
      <Container className="flex h-full items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 whitespace-nowrap text-base font-semibold text-ink sm:gap-2 sm:text-lg">
          <TraceRing size={22} />
          RootTrace <span className="text-brand-blue">Ivory</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button variant="secondary" fullWidth={false} className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button fullWidth={false} className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base">
              Get started
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
