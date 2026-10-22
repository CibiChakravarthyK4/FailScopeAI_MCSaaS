import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { TraceRing } from '../ui/TraceRing';
import { Container } from './Container';
import { NavDropdown } from './NavDropdown';

// Blog is a Phase 3 page that doesn't exist yet - it joins Resources once
// it ships, rather than linking to a route that 404s.
const PRODUCT_ITEMS = [
  { label: 'Overview', href: '/#product' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Product Tour', href: '/tour' },
];
const RESOURCES_ITEMS = [
  { label: 'Help Center', href: '/help' },
  { label: 'FAQ', href: '/faq' },
];
const COMPANY_ITEMS = [
  { label: 'Company Overview', href: '/company' },
  { label: 'Join our Team', href: '/careers' },
  { label: 'Contact Us', href: '/contact' },
];

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MarketingHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 whitespace-nowrap text-base font-semibold text-ink sm:gap-2 sm:text-lg">
          <TraceRing size={22} />
          RootTrace <span className="text-brand-blue">Ivory</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <NavDropdown label="Product" items={PRODUCT_ITEMS} />
          <Link to="/pricing" className="text-sm font-medium text-muted hover:text-ink">
            Pricing
          </Link>
          <Link to="/security" className="text-sm font-medium text-muted hover:text-ink">
            Security
          </Link>
          <NavDropdown label="Resources" items={RESOURCES_ITEMS} />
          <NavDropdown label="Company" items={COMPANY_ITEMS} />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/demo" className="mr-1 text-sm font-medium text-brand-blue hover:text-brand-blue-dark">
            Request a demo
          </Link>
          <Link to="/login">
            <Button variant="secondary" fullWidth={false} className="px-4 py-2 text-sm">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button fullWidth={false} className="px-4 py-2 text-sm">
              Get started
            </Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((v) => !v)}
          className="text-ink lg:hidden"
        >
          {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      {isMobileOpen && (
        <div className="border-t border-line bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <a href="/#product" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Overview
            </a>
            <a href="/#how-it-works" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              How it works
            </a>
            <Link to="/integrations" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Integrations
            </Link>
            <Link to="/tour" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Product Tour
            </Link>
            <Link to="/pricing" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Pricing
            </Link>
            <Link to="/security" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Security
            </Link>
            <Link to="/help" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Help Center
            </Link>
            <Link to="/faq" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              FAQ
            </Link>
            <Link to="/company" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Company Overview
            </Link>
            <Link to="/careers" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Join our Team
            </Link>
            <Link to="/contact" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-brand-blue-light">
              Contact Us
            </Link>
            <Link to="/demo" className="rounded-md px-2 py-2 text-sm font-medium text-brand-blue hover:bg-brand-blue-light">
              Request a demo
            </Link>
            <div className="mt-2 flex gap-2 border-t border-line pt-4">
              <Link to="/login" className="flex-1">
                <Button variant="secondary" className="py-2 text-sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button className="py-2 text-sm">Get started</Button>
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
