import { Container } from './Container';

// The 6 taxonomy categories (CLAUDE.md, docs/design-system.md) - named here
// so the "6" stat means something concrete instead of an unexplained number.
const CATEGORIES = 'Application bug, script issue, data issue, environment, integration, unknown';

// Only the first stat is an actual number; the other two are qualitative
// taglines, not statistics - giving all three the same giant numeral-style
// size made the one real number ("6") fail to stand out from its neighbors.
const TAGLINES = [
  { label: 'Evidence-linked', description: 'Every diagnosis cites real evidence' },
  { label: 'Human-reviewed', description: 'Nothing is filed as a defect without sign-off' },
];

export function TrustStrip() {
  return (
    <section className="border-t border-line py-16 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col items-center justify-center py-6 text-center sm:py-0">
            <p className="text-5xl font-semibold text-brand-blue">6</p>
            <p className="mt-2 text-sm text-muted">Failure categories classified</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted capitalize">{CATEGORIES}</p>
          </div>
          {TAGLINES.map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center py-6 text-center sm:py-0">
              <p className="text-xl font-semibold text-ink">{item.label}</p>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
