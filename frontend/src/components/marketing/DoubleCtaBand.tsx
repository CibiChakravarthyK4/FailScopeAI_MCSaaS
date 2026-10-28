import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from './Container';

interface CtaLink {
  label: string;
  to: string;
}

// The two-button variant of FinalCta's single-button band, for pages that
// want to offer a human conversation (Talk to us) alongside a secondary path
// rather than a single "Get started".
export function DoubleCtaBand({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string;
  subtitle?: string;
  primary: CtaLink;
  secondary: CtaLink;
}) {
  return (
    <section className="bg-iv-blue-50 py-16 lg:py-24">
      <Container className="text-center">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-lg text-muted">{subtitle}</p>}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={primary.to}>
            <Button fullWidth={false} className="px-6 py-3">
              {primary.label}
            </Button>
          </Link>
          <Link to={secondary.to}>
            <Button variant="secondary" fullWidth={false} className="px-6 py-3">
              {secondary.label}
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
