import { Link } from 'react-router-dom';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { TraceRing } from '../ui/TraceRing';

export function ErrorStatePage({
  code,
  title,
  description,
}: {
  code?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center py-16">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <TraceRing size={40} />
            {code && <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-blue">{code}</p>}
            <h1 className="mt-2 text-2xl font-semibold text-ink">{title}</h1>
            <p className="mt-3 text-muted">{description}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/">
                <Button fullWidth={false} className="px-6">
                  Back home
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" fullWidth={false} className="px-6">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <MarketingFooter />
    </div>
  );
}
