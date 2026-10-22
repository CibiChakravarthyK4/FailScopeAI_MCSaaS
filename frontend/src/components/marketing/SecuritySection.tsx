import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

const POINTS = [
  'Tenant isolation — every account only ever sees its own data.',
  'Role-based access — admin, analyst, reviewer and viewer, enforced on every request.',
  'Secrets redacted — credentials and tokens are scrubbed before anything reaches the model.',
  'Human review — nothing becomes a defect without a reviewer confirming it.',
];

export function SecuritySection() {
  return (
    <section id="security" className="border-t border-line py-16 lg:py-24">
      <Container>
        <SectionHeading title="Security and control" />
        <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-ink">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 flex-shrink-0 text-brand-blue"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
