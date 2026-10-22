import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from './Container';
import { ProductPreviewCard } from './ProductPreviewCard';

export function Hero() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-5 inline-block rounded-full border border-line bg-brand-blue-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
              Test Failure Investigator
            </span>
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-[56px] lg:leading-[1.14]">
              Find the root cause of every failed test, backed by evidence.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              RootTrace Ivory ingests your JUnit failures, correlates the evidence, and gives your team a
              root cause in minutes — reviewed and confirmed by a human before it ever becomes a defect.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/register">
                <Button fullWidth={false} className="px-6 py-3">
                  Get started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" fullWidth={false} className="px-6 py-3">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <ProductPreviewCard />
        </div>
      </Container>
    </section>
  );
}
