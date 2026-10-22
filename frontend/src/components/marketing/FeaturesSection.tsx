import { Card } from '../ui/Card';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

function EvidenceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 20.5 16 16" />
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

function ReviewerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 11 2 2 4-4" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3m0 0 4 4m-4-4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: EvidenceIcon,
    title: 'Evidence-backed diagnosis',
    description:
      'Every hypothesis cites the exact stack trace or log line behind it — no black-box guesses, and it abstains when the evidence is too thin.',
  },
  {
    icon: ShieldIcon,
    title: 'Secrets redacted automatically',
    description:
      'Credentials, tokens, and connection strings are scrubbed from logs before anything is sent to the model.',
  },
  {
    icon: ReviewerIcon,
    title: 'Reviewer stays in control',
    description: 'Accept, reject, or correct every call. Nothing gets filed as a defect without a human saying so.',
  },
  {
    icon: ExportIcon,
    title: 'One-click defect export',
    description: 'Turn a confirmed failure into a clean, evidence-linked defect draft, ready to publish.',
  },
];

export function FeaturesSection() {
  return (
    <section id="product" className="border-t border-line bg-brand-blue-light/40 py-16 lg:py-24">
      <Container>
        <SectionHeading title="Why teams switch" subtitle="Investigation you can actually trust." />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="flex h-full flex-col">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                  <Icon />
                </div>
                <h3 className="mb-2 font-semibold text-ink">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
