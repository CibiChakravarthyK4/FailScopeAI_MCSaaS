import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { LegalLayout } from '../components/marketing/LegalLayout';
import { company } from '../config/company';
import { useSeo } from '../utils/useSeo';

const TOC = [
  { id: 'not-allowed', label: 'Not allowed' },
  { id: 'enforcement', label: 'Enforcement' },
  { id: 'contact', label: 'Contact' },
];

export function AcceptableUsePage() {
  useSeo('Acceptable Use Policy', 'What you agree not to do when using RootTrace Ivory.', '/acceptable-use');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <LegalLayout
          label="Acceptable Use Policy"
          title="Using RootTrace Ivory responsibly."
          version={company.legal.terms.version}
          effectiveDate={company.legal.terms.effectiveDate}
          tocItems={TOC}
        >
          <section id="not-allowed">
            <h2 className="text-xl font-semibold text-ink">Not allowed</h2>
            <p className="mt-3 text-muted">When using RootTrace Ivory, you agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li>Access, or attempt to access, another workspace's data without authorization.</li>
              <li>Disrupt or attempt to disrupt the service, including excessive automated requests.</li>
              <li>Upload unlawful content, malware, or content that infringes someone else's rights.</li>
              <li>Reverse-engineer the service beyond what applicable law permits.</li>
              <li>Use the service to build a directly competing product.</li>
              <li>Circumvent any rate limit, quota or access control.</li>
            </ul>
          </section>

          <section id="enforcement">
            <h2 className="text-xl font-semibold text-ink">Enforcement</h2>
            <p className="mt-3 text-muted">
              A material breach of this policy may lead to suspension or termination of access, as described in our{' '}
              <Link to="/terms" className="text-brand-blue hover:text-brand-blue-dark">
                Terms and Conditions
              </Link>
              .
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3 text-muted">
              Questions about this policy, or to report misuse, can be sent to{' '}
              <a href={`mailto:${company.supportEmail}`} className="text-brand-blue hover:text-brand-blue-dark">
                {company.supportEmail}
              </a>
              .
            </p>
          </section>
        </LegalLayout>
      </main>
      <MarketingFooter />
    </div>
  );
}
