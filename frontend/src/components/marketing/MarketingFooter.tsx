import { Link } from 'react-router-dom';
import { TraceRing } from '../ui/TraceRing';
import { Container } from './Container';

export function MarketingFooter() {
  return (
    <footer className="border-t border-line py-16">
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-ink">
              <TraceRing size={20} />
              RootTrace <span className="text-brand-blue">Ivory</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Find the root cause of every failed test, backed by evidence.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Product</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="#product" className="hover:text-ink">
                  Product
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-ink">
                  How it works
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-ink">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Account</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/login" className="hover:text-ink">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-ink">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-sm text-muted">
          © {new Date().getFullYear()} RootTrace Ivory.
        </div>
      </Container>
    </footer>
  );
}
