import { Link } from 'react-router-dom';
import { TraceRing } from '../ui/TraceRing';
import { Container } from './Container';
import { company } from '../../config/company';

export function MarketingFooter() {
  return (
    <footer className="border-t border-line py-16">
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-ink">
              <TraceRing size={20} />
              RootTrace <span className="text-brand-blue">Ivory</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">{company.shortDescription}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Product</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/#product" className="hover:text-ink">
                  Overview
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-ink">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-ink">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-ink">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/tour" className="hover:text-ink">
                  Product Tour
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Company</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/company" className="hover:text-ink">
                  Company Overview
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-ink">
                  Join our Team
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-ink">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-ink">
                  Request a Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Legal and help</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/privacy" className="hover:text-ink">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-ink">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-ink">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/acceptable-use" className="hover:text-ink">
                  Acceptable Use Policy
                </Link>
              </li>
              <li>
                <Link to="/subprocessors" className="hover:text-ink">
                  Subprocessors
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-ink">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}.
          </p>
          <a href={`mailto:${company.grievanceOfficer.email}`} className="hover:text-ink">
            Grievance Officer
          </a>
        </div>
      </Container>
    </footer>
  );
}
