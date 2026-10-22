import { Container } from './Container';

const STATS = [
  { value: '6', label: 'Failure categories classified' },
  { value: 'Evidence-linked', label: 'Every diagnosis cites real evidence' },
  { value: 'Human-reviewed', label: 'Nothing is filed as a defect without sign-off' },
];

export function TrustStrip() {
  return (
    <section className="border-t border-line py-16 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-6 text-center sm:py-0">
              <p className="text-3xl font-semibold text-brand-blue">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
