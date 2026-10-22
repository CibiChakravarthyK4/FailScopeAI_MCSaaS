import { Container } from './Container';

// Every public page: small label, one H1, one-line subtitle (CLAUDE.md-style
// consistency, mirroring the app's PageHeader but in the marketing section's
// larger type scale and 96px/64px section padding).
export function PublicPageHeader({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div className="py-16 lg:py-24">
      <Container>
        <div className="max-w-2xl">
          {label && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-blue">{label}</p>}
          <h1 className="text-3xl font-semibold text-ink lg:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
        </div>
      </Container>
    </div>
  );
}
