import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

const STEPS = [
  { step: '1', title: 'Import', description: 'Upload a failed JUnit run with its logs and screenshots.' },
  { step: '2', title: 'Investigate', description: 'The model classifies the failure and cites the evidence behind it.' },
  { step: '3', title: 'Review & export', description: 'Confirm or correct the call, then export a clean defect.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24">
      <Container>
        <SectionHeading title="How it works" />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="absolute left-1/2 top-5 hidden h-px w-full -translate-x-1/2 bg-line sm:block" />
              )}
              <div className="relative z-10 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white font-semibold text-brand-blue ring-2 ring-brand-blue">
                {s.step}
              </div>
              <h3 className="mb-1 font-semibold text-ink">{s.title}</h3>
              <p className="text-sm text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
