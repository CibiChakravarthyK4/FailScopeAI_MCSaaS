import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from './Container';

export function FinalCta() {
  return (
    <section className="bg-iv-blue-50 py-16 lg:py-24">
      <Container className="text-center">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Ready to stop guessing at failures?</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
          Create a workspace and import your first failed run in minutes.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/register">
            <Button fullWidth={false} className="px-6 py-3">
              Get started
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
