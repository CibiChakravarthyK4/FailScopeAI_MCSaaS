import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { DoubleCtaBand } from '../components/marketing/DoubleCtaBand';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { useSeo } from '../utils/useSeo';

function EvidenceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 20.5 16 16" />
    </svg>
  );
}

function ReviewerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 11 2 2 4-4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PlainLanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  );
}

const WHAT_WE_BUILD = [
  'Import failed test runs from your existing JUnit XML, logs and screenshots.',
  'Get an evidence-backed diagnosis that cites the exact line behind every hypothesis.',
  'Export a clean, human-reviewed defect once a reviewer confirms the call.',
];

const VALUES = [
  {
    icon: EvidenceIcon,
    title: 'Evidence first',
    description: 'Every diagnosis cites the exact stack trace or log line behind it. No claim without a citation.',
  },
  {
    icon: ReviewerIcon,
    title: 'Human in control',
    description: 'Suggestions are reviewed, corrected or rejected by a person before anything becomes a defect.',
  },
  {
    icon: ShieldIcon,
    title: 'Privacy by design',
    description: 'Tenant isolation and secret redaction are built in, not bolted on afterward.',
  },
  {
    icon: PlainLanguageIcon,
    title: 'Plain language',
    description: 'No inflated claims, no invented statistics - just what the product actually does.',
  },
];

export function CompanyPage() {
  useSeo(
    'Company Overview',
    'Why RootTrace Ivory exists and how we build it: evidence first, human in control, privacy by design.',
    '/company'
  );

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Company Overview"
          title="Software teams shouldn't lose hours to a failed test."
          subtitle="RootTrace Ivory exists to turn a red build into a clear, evidence-backed answer."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-semibold text-ink">Who we are</h2>
              <p className="mt-4 text-muted">
                Every team that runs automated tests knows the pattern: a run turns red, and someone has to stop
                what they're doing to dig through logs, stack traces and screenshots to figure out why. That
                investigation is repetitive, time-consuming, and often falls on whoever happens to be free. We
                built RootTrace Ivory to make that investigation faster and more consistent, without removing the
                person who ultimately decides what the failure means.
              </p>
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-iv-bg py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">What we build</h2>
            <div className="mx-auto mt-8 max-w-2xl space-y-4">
              {WHAT_WE_BUILD.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-line bg-white p-4">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />
                  <p className="text-sm text-ink">{item}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">How we work</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {VALUES.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.title} className="flex h-full flex-col">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                      <Icon />
                    </div>
                    <h3 className="mb-2 font-semibold text-ink">{value.title}</h3>
                    <p className="text-sm text-muted">{value.description}</p>
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-iv-bg py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-ink">Security and trust</h2>
              <p className="mt-4 text-muted">
                Tenant isolation, role-based access, secret redaction and human review are built into the product
                from the start, not added later.{' '}
                <Link to="/security" className="font-medium text-brand-blue hover:text-brand-blue-dark">
                  Read our security and trust page
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>

        <DoubleCtaBand
          title="Want to know more?"
          subtitle="Talk to us about how RootTrace Ivory could fit your team, or see our open roles."
          primary={{ label: 'Talk to us', to: '/contact' }}
          secondary={{ label: 'Join our Team', to: '/careers' }}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
