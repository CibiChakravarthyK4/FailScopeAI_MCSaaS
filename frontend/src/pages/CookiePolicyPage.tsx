import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { LegalLayout } from '../components/marketing/LegalLayout';
import { company } from '../config/company';
import { useSeo } from '../utils/useSeo';

const TOC = [
  { id: 'current-use', label: 'Current use' },
  { id: 'how-sessions-work', label: 'How sessions work instead' },
  { id: 'if-this-changes', label: 'If this changes' },
  { id: 'contact', label: 'Contact' },
];

export function CookiePolicyPage() {
  useSeo('Cookie Policy', 'RootTrace Ivory does not currently set any cookies.', '/cookies');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <LegalLayout
          label="Cookie Policy"
          title="We don't use cookies today."
          version={company.legal.privacy.version}
          effectiveDate={company.legal.privacy.effectiveDate}
          tocItems={TOC}
        >
          <section id="current-use">
            <h2 className="text-xl font-semibold text-ink">Current use</h2>
            <p className="mt-3 text-muted">
              RootTrace Ivory does not currently set any cookies - no essential, analytics or advertising cookies.
            </p>
          </section>

          <section id="how-sessions-work">
            <h2 className="text-xl font-semibold text-ink">How sessions work instead</h2>
            <p className="mt-3 text-muted">
              Signing in stores an access token in your browser's local storage rather than a cookie. It's sent only
              to our own API and isn't accessible to other sites.
            </p>
          </section>

          <section id="if-this-changes">
            <h2 className="text-xl font-semibold text-ink">If this changes</h2>
            <p className="mt-3 text-muted">
              If we add analytics or marketing cookies in the future, we will update this page first and show a
              consent banner before any non-essential cookie is set.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3 text-muted">
              Questions about this policy can be sent to{' '}
              <a href={`mailto:${company.supportEmail}`} className="text-brand-blue hover:text-brand-blue-dark">
                {company.supportEmail}
              </a>
              . See also our{' '}
              <Link to="/privacy" className="text-brand-blue hover:text-brand-blue-dark">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </LegalLayout>
      </main>
      <MarketingFooter />
    </div>
  );
}
