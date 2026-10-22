import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter';
import { TaxonomyChip } from '../components/ui/TaxonomyChip';
import { TraceRing } from '../components/ui/TraceRing';
import { useSeo } from '../utils/useSeo';

// Every mockup below is built from the real design-system components with
// fixed demo data - not a screenshot or a stock image, and not wired to any
// real data, so it stays accurate to the actual UI without fetching anything.

function ImportMockup() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-line bg-iv-bg px-4 py-6 text-center">
        <TraceRing size={24} />
        <div className="text-left">
          <p className="text-sm font-medium text-ink">sample-run.xml</p>
          <p className="text-xs text-muted">12 tests found, 3 failures</p>
        </div>
      </div>
    </Card>
  );
}

function EvidenceMockup() {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">test_checkout_flow</p>
        <StatusBadge status="failed" />
      </div>
      <div className="rounded-md bg-iv-bg px-3 py-2 font-mono text-xs text-ink">
        AssertionError: expected 200 but got 500
        <br />
        checkout_test.py:42
      </div>
    </Card>
  );
}

function ReviewMockup() {
  return (
    <Card className="p-5">
      <div className="mb-3">
        <TaxonomyChip category="application_bug" />
      </div>
      <div className="mb-4">
        <ConfidenceMeter score={0.87} />
      </div>
      <div className="flex gap-2">
        <Button fullWidth={false} className="px-4 py-1.5 text-sm">
          Accept
        </Button>
        <Button variant="secondary" fullWidth={false} className="px-4 py-1.5 text-sm">
          Reject
        </Button>
      </div>
    </Card>
  );
}

function ExportMockup() {
  return (
    <Card className="p-5">
      <p className="mb-2 text-sm font-medium text-ink">Defect draft</p>
      <p className="mb-4 text-xs text-muted">
        test_checkout_flow · Application Bug · evidence-linked summary ready for export
      </p>
      <Button fullWidth={false} className="px-4 py-1.5 text-sm">
        Create defect export
      </Button>
    </Card>
  );
}

const STEPS = [
  {
    number: '1',
    title: 'Import',
    description:
      'Upload a JUnit XML report with optional logs and screenshots. The run is parsed and the evidence is prepared automatically.',
    mockup: ImportMockup,
  },
  {
    number: '2',
    title: 'Evidence',
    description:
      'Each failed test case shows its stack trace and attached artifacts, ready to be cited by a diagnosis.',
    mockup: EvidenceMockup,
  },
  {
    number: '3',
    title: 'Review',
    description:
      'A suggested category and confidence score are shown alongside the evidence behind them. A reviewer accepts, rejects or corrects the call.',
    mockup: ReviewMockup,
  },
  {
    number: '4',
    title: 'Export',
    description: 'Once confirmed, the failure becomes a clean, evidence-linked defect draft, ready to export.',
    mockup: ExportMockup,
  },
];

export function ProductTourPage() {
  useSeo('Product Tour', 'A walkthrough of importing a run, evidence, review and defect export in RootTrace Ivory.', '/tour');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Product Tour"
          title="From a failed test to a confirmed defect."
          subtitle="Four steps, shown with the real interface - not stock images."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="space-y-16">
              {STEPS.map((step, i) => {
                const Mockup = step.mockup;
                return (
                  <div
                    key={step.title}
                    className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${
                      i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                    }`}
                  >
                    <div>
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-blue text-sm font-semibold text-brand-blue">
                        {step.number}
                      </div>
                      <h2 className="mb-2 text-xl font-semibold text-ink">{step.title}</h2>
                      <p className="text-muted">{step.description}</p>
                    </div>
                    <Mockup />
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
