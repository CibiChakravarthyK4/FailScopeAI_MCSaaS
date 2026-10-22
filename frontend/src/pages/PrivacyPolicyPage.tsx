import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { LegalLayout } from '../components/marketing/LegalLayout';
import { company } from '../config/company';
import { useSeo } from '../utils/useSeo';

const TOC = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'data-we-collect', label: 'Data we collect' },
  { id: 'how-we-use-it', label: 'How we use it' },
  { id: 'how-artifacts-are-processed', label: 'How artifacts are processed' },
  { id: 'sharing-and-subprocessors', label: 'Sharing and subprocessors' },
  { id: 'security', label: 'Security measures' },
  { id: 'retention-and-deletion', label: 'Retention and deletion' },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'international-transfers', label: 'International transfers' },
  { id: 'children', label: 'Children' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'changes', label: 'Changes to this policy' },
  { id: 'contact', label: 'Contact and Grievance Officer' },
];

// [LEGAL REVIEW] This entire page is placeholder drafting, structured to be
// compatible with India's DPDP Act 2023 and IT Act, and organised so GDPR-
// specific clauses (lawful basis, DPO contact, SCCs) can be slotted in later
// without restructuring. It must be reviewed by counsel before go-live.
export function PrivacyPolicyPage() {
  useSeo('Privacy Policy', 'How RootTrace Ivory collects, uses, and protects your data.', '/privacy');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <LegalLayout
          label="Privacy Policy"
          title="Safeguarding your data, always."
          version={company.legal.privacy.version}
          effectiveDate={company.legal.privacy.effectiveDate}
          tocItems={TOC}
        >
          <section id="who-we-are">
            <h2 className="text-xl font-semibold text-ink">Who we are</h2>
            <p className="mt-3 text-muted">
              RootTrace Ivory is operated by {company.legalName}. This policy explains what data we collect when you
              or your organization use RootTrace Ivory, why we collect it, and what choices you have. If anything
              here is unclear, you can reach us at{' '}
              <a href={`mailto:${company.supportEmail}`} className="text-brand-blue hover:text-brand-blue-dark">
                {company.supportEmail}
              </a>
              .
            </p>
          </section>

          <section id="data-we-collect">
            <h2 className="text-xl font-semibold text-ink">Data we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li>
                <strong className="text-ink">Account data:</strong> your name and email, and if you sign in with
                Google, the profile data Google shares with us (name, email, profile photo).
              </li>
              <li>
                <strong className="text-ink">Workspace and team data:</strong> your workspace name, role, and the
                other members of your workspace.
              </li>
              <li>
                <strong className="text-ink">Uploaded test artifacts:</strong> JUnit XML results, logs, and
                screenshots you import to investigate a test failure.
              </li>
              <li>
                <strong className="text-ink">Usage and billing data:</strong> job runs, storage used, and plan/billing
                status for your workspace.
              </li>
              <li>
                <strong className="text-ink">Technical data:</strong> IP address, browser and device information,
                and timestamps of requests, mainly for security and troubleshooting.
              </li>
              <li>
                <strong className="text-ink">Cookies:</strong> see the Cookies section below.
              </li>
            </ul>
          </section>

          <section id="how-we-use-it">
            <h2 className="text-xl font-semibold text-ink">How we use it</h2>
            <p className="mt-3 text-muted">
              We use this data to operate the product you signed up for: authenticating you, running diagnoses on
              the test failures you import, showing you usage against your plan, responding to support requests, and
              keeping the service secure and reliable. We do not sell your data.
            </p>
          </section>

          <section id="how-artifacts-are-processed">
            <h2 className="text-xl font-semibold text-ink">How artifacts are processed</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li>Your workspace's data is isolated from every other workspace, enforced on every request.</li>
              <li>Credentials, tokens and connection strings are redacted before any evidence reaches a model.</li>
              <li>
                Evidence is analyzed using automated analysis, including a third-party language model provider, to
                suggest a likely cause - see{' '}
                <Link to="/security" className="text-brand-blue hover:text-brand-blue-dark">
                  Security and Trust
                </Link>{' '}
                for what that provider sees.
              </li>
              <li>No suggestion becomes a defect without a human reviewer confirming it.</li>
              <li>
                We do not use your uploaded artifacts to train our own or a third party's general-purpose models
                unless you agree to that in writing, separately from this policy.
              </li>
            </ul>
          </section>

          <section id="sharing-and-subprocessors">
            <h2 className="text-xl font-semibold text-ink">Sharing and subprocessors</h2>
            <p className="mt-3 text-muted">
              We share data with a small number of service providers who help us run RootTrace Ivory - for example,
              cloud hosting, a language model provider for diagnosis, and (if you connect it) Jira for defect export.
              See our full{' '}
              <Link to="/subprocessors" className="text-brand-blue hover:text-brand-blue-dark">
                Subprocessors
              </Link>{' '}
              list for details. We do not share your data with anyone else except where the law requires it.
            </p>
          </section>

          <section id="security">
            <h2 className="text-xl font-semibold text-ink">Security measures</h2>
            <p className="mt-3 text-muted">
              We encrypt traffic to and from RootTrace Ivory, isolate each workspace's data, redact secrets before
              analysis, and keep an audit trail of imports, reviewer actions and exports. See our full{' '}
              <Link to="/security" className="text-brand-blue hover:text-brand-blue-dark">
                Security and Trust
              </Link>{' '}
              page for details.
            </p>
          </section>

          <section id="retention-and-deletion">
            <h2 className="text-xl font-semibold text-ink">Retention and deletion</h2>
            <p className="mt-3 text-muted">
              {/* [LEGAL REVIEW] retention periods are not yet finalized. */}
              We retain your data for as long as your workspace is active, plus{' '}
              <strong className="text-ink">[retention period after closure]</strong>, unless a longer period is
              required by law. You can request deletion of your account and workspace data by emailing{' '}
              <a href={`mailto:${company.supportEmail}`} className="text-brand-blue hover:text-brand-blue-dark">
                {company.supportEmail}
              </a>
              . We will confirm once deletion is complete.
            </p>
          </section>

          <section id="your-rights">
            <h2 className="text-xl font-semibold text-ink">Your rights</h2>
            <p className="mt-3 text-muted">
              Subject to applicable law, you can ask us to: give you access to your personal data, correct inaccurate
              data, delete your data, or withdraw a consent you previously gave us. You can also raise a grievance -
              see the Contact section below. We will respond within a reasonable time.
            </p>
          </section>

          <section id="international-transfers">
            <h2 className="text-xl font-semibold text-ink">International transfers</h2>
            <p className="mt-3 text-muted">
              {/* [LEGAL REVIEW] hosting location(s) not yet finalized (CLAUDE.md Section 9). */}
              Depending on where our infrastructure and service providers are located, your data may be processed in
              a country other than your own. Where that happens, we take steps appropriate to the sensitivity of the
              data involved.
            </p>
          </section>

          <section id="children">
            <h2 className="text-xl font-semibold text-ink">Children</h2>
            <p className="mt-3 text-muted">
              RootTrace Ivory is a business tool and is not directed at, or intended for use by, anyone under 18.
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold text-ink">Cookies</h2>
            <p className="mt-3 text-muted">
              We currently use only essential cookies needed to keep you signed in and to remember basic preferences.
              We do not currently use analytics or advertising cookies. See our{' '}
              <Link to="/cookies" className="text-brand-blue hover:text-brand-blue-dark">
                Cookie Policy
              </Link>{' '}
              for more detail once it is published.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-xl font-semibold text-ink">Changes to this policy</h2>
            <p className="mt-3 text-muted">
              If we make a material change to this policy, we will update the version and effective date above, and
              ask you to accept the new version the next time you sign in.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold text-ink">Contact and Grievance Officer</h2>
            <p className="mt-3 text-muted">
              For privacy questions, email{' '}
              <a href={`mailto:${company.supportEmail}`} className="text-brand-blue hover:text-brand-blue-dark">
                {company.supportEmail}
              </a>
              . Our Grievance Officer, in accordance with applicable Indian law, is:
            </p>
            <p className="mt-3 text-ink">
              {company.grievanceOfficer.name}
              <br />
              <a
                href={`mailto:${company.grievanceOfficer.email}`}
                className="text-brand-blue hover:text-brand-blue-dark"
              >
                {company.grievanceOfficer.email}
              </a>
              <br />
              {company.grievanceOfficer.address}
            </p>
          </section>
        </LegalLayout>
      </main>
      <MarketingFooter />
    </div>
  );
}
