import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { useSeo } from '../utils/useSeo';

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted">
      <ClockIcon />
      {label}
    </span>
  );
}

export function IntegrationsPage() {
  useSeo('Integrations', 'How RootTrace Ivory connects to Jira and other tools.', '/integrations');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Integrations"
          title="Connect RootTrace Ivory to the tools you already use."
          subtitle="Only what's actually built or in progress is listed here."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl">
              <Card className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-ink">Jira</h2>
                  <p className="mt-2 text-sm text-muted">
                    Export a confirmed defect straight from a case file, with the evidence-linked summary already
                    filled in. The export flow is built end to end in the app; connecting it to your own Jira
                    instance is still in progress.
                  </p>
                </div>
                <StatusPill label="In progress" />
              </Card>

              <div className="mt-10 rounded-lg border border-line bg-iv-bg p-6 text-center">
                <p className="text-sm font-medium text-ink">Looking for a specific integration?</p>
                <p className="mt-1 text-sm text-muted">
                  We don't have a public roadmap for other integrations yet.{' '}
                  <Link to="/contact" className="text-brand-blue hover:text-brand-blue-dark">
                    Tell us what you'd like to see
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
