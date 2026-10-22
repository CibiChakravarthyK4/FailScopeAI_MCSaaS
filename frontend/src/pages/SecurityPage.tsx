import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { company } from '../config/company';
import { useSeo } from '../utils/useSeo';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StatusPill({ status }: { status: 'implemented' | 'planned' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'implemented' ? 'bg-brand-blue-light text-brand-blue' : 'border border-line text-muted'
      }`}
    >
      {status === 'implemented' ? <CheckIcon /> : <ClockIcon />}
      {status === 'implemented' ? 'Implemented' : 'Planned'}
    </span>
  );
}

const CONTROLS: { title: string; status: 'implemented' | 'planned'; description: string }[] = [
  {
    title: 'Tenant isolation',
    status: 'implemented',
    description: 'Every database query and storage path is scoped by tenant; cross-tenant access is rejected server-side.',
  },
  {
    title: 'Role-based access',
    status: 'implemented',
    description:
      'Admin, Analyst, Reviewer and Viewer roles within a workspace, enforced on every API request - not just hidden in the UI.',
  },
  {
    title: 'Secrets redaction',
    status: 'implemented',
    description:
      'Credentials, tokens and connection strings are stripped from logs before anything reaches the diagnosis model.',
  },
  {
    title: 'Reliable background jobs',
    status: 'implemented',
    description: 'Imports and diagnoses run as tracked background jobs (queued, processing, completed, failed) with retry limits.',
  },
  {
    title: 'Audit logs',
    status: 'implemented',
    description: 'Imports, reviewer actions and exports are recorded with an actor and a timestamp.',
  },
  {
    title: 'Usage quotas',
    status: 'implemented',
    description: 'Job runs, storage and model usage are tracked per workspace against a configured ceiling.',
  },
  {
    title: 'Backups and restore',
    status: 'implemented',
    description: 'The database and uploaded artifacts are backed up, and restoring from a backup has been tested end to end.',
  },
  {
    title: 'Model transparency',
    status: 'implemented',
    description: 'Every diagnosis records the model provider, model name and prompt version, and shows its confidence and evidence.',
  },
  {
    title: 'Human review before export',
    status: 'implemented',
    description: 'No suggested category becomes a defect until a reviewer accepts, rejects or corrects it.',
  },
];

export function SecurityPage() {
  useSeo(
    'Security and Trust',
    'What RootTrace Ivory actually implements for tenant isolation, access control, redaction and audit - and what is still planned.',
    '/security'
  );

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Security and Trust"
          title="What we actually do, described plainly."
          subtitle="No certifications are claimed here - only what is built, or clearly marked as planned."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {CONTROLS.map((control) => (
                <Card key={control.title} className="flex h-full flex-col">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-ink">{control.title}</h3>
                    <StatusPill status={control.status} />
                  </div>
                  <p className="text-sm text-muted">{control.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-iv-bg py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-semibold text-ink">What our language model provider sees</h2>
              <p className="mt-4 text-muted">
                When a diagnosis runs, only the evidence needed for that test case - stack traces, log excerpts and
                screenshots - is sent to our configured language model provider, after credentials, tokens and
                connection strings have been redacted. We do not send your full codebase, your other workspaces'
                data, or anything outside the evidence attached to that run.
              </p>
            </div>
          </Container>
        </section>

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-ink">Report a security issue</h2>
              <p className="mt-4 text-muted">
                If you believe you've found a security issue, please email us directly rather than filing a public
                issue.
              </p>
              <a
                href={`mailto:${company.securityEmail}`}
                className="mt-4 inline-block font-medium text-brand-blue hover:text-brand-blue-dark"
              >
                {company.securityEmail}
              </a>
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
