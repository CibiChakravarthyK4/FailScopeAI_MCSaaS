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
        <div className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* A single track on the grid itself, inset on each side by the
             exact distance from the grid's edge to the first/last column's
             center: for 3 equal 1fr columns with a gap-8 (2rem) gutter, each
             column is (100% - 2*2rem)/3 wide, so its center sits (100% -
             4rem)/6 in from that edge. This is exact algebra, not a guessed
             pixel value, so it holds at every breakpoint - unlike the old
             per-cell line (left-1/2 w-full), which spanned each cell's full
             width and overhung past the first/last circles on the outside. */}
          <div className="absolute top-5 left-[calc((100%-4rem)/6)] right-[calc((100%-4rem)/6)] hidden h-px bg-line sm:block" />
          {STEPS.map((s) => (
            <div key={s.step} className="relative text-center">
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
