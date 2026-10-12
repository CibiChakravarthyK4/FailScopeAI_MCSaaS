import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const FEATURES = [
  {
    title: 'Evidence-backed diagnosis',
    description:
      'Every AI hypothesis cites the exact stack trace or log line behind it — no black-box guesses, and it abstains when the evidence is too thin.',
  },
  {
    title: 'Secrets redacted automatically',
    description:
      'Credentials, tokens, and connection strings are scrubbed from logs before anything is sent to the model.',
  },
  {
    title: 'Reviewer stays in control',
    description:
      'Accept, reject, or correct every AI call. Nothing gets filed as a defect without a human saying so.',
  },
  {
    title: 'One-click defect export',
    description: 'Turn a confirmed failure into a clean, evidence-linked defect draft, ready to publish.',
  },
];

const STEPS = [
  { step: '1', title: 'Import', description: 'Upload a failed JUnit run with its logs and screenshots.' },
  { step: '2', title: 'Investigate', description: 'AI classifies the failure and cites the evidence behind it.' },
  { step: '3', title: 'Review & export', description: 'Confirm or correct the call, then export a clean defect.' },
];

export function HomePage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold text-ink">
            FailScope <span className="text-brand-blue">AI</span>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="secondary" className="w-auto px-4 py-2">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="w-auto px-4 py-2">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Investigate failed tests with AI —<br className="hidden sm:block" /> not guesswork.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            FailScope AI ingests your JUnit failures, correlates the evidence, and gives your team an
            evidence-backed root cause in minutes — reviewed and confirmed by a human before it ever becomes a
            defect.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button className="w-auto px-6 py-3">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="w-auto px-6 py-3">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-line bg-brand-blue-light/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-brand-blue">
              Why teams switch
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <h3 className="mb-2 font-semibold text-ink">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-brand-blue">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue font-semibold text-white">
                  {s.step}
                </div>
                <h3 className="mb-1 font-semibold text-ink">{s.title}</h3>
                <p className="text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold text-ink">Ready to stop guessing at failures?</h2>
            <p className="mt-2 text-muted">Create a workspace and import your first failed run in minutes.</p>
            <div className="mt-6">
              <Link to="/register">
                <Button className="w-auto px-6 py-3">Get started free</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted">
          FailScope AI — AI Test Failure Investigator
        </div>
      </footer>
    </div>
  );
}
