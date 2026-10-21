import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

function EvidenceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 20.5 16 16" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ReviewerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 11 2 2 4-4" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3m0 0 4 4m-4-4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: EvidenceIcon,
    title: 'Evidence-backed diagnosis',
    description:
      'Every AI hypothesis cites the exact stack trace or log line behind it — no black-box guesses, and it abstains when the evidence is too thin.',
  },
  {
    icon: ShieldIcon,
    title: 'Secrets redacted automatically',
    description:
      'Credentials, tokens, and connection strings are scrubbed from logs before anything is sent to the model.',
  },
  {
    icon: ReviewerIcon,
    title: 'Reviewer stays in control',
    description:
      'Accept, reject, or correct every AI call. Nothing gets filed as a defect without a human saying so.',
  },
  {
    icon: ExportIcon,
    title: 'One-click defect export',
    description: 'Turn a confirmed failure into a clean, evidence-linked defect draft, ready to publish.',
  },
];

const STATS = [
  { value: '6', label: 'Failure categories classified' },
  { value: '100%', label: 'Diagnoses cite real evidence' },
  { value: '0', label: 'Defects filed without human review' },
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
            RootTrace <span className="text-brand-blue">Ivory</span>
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
          <span className="mb-5 inline-block rounded-full border border-line bg-brand-blue-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
            Test Failure Investigator
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Investigate failed tests with AI —<br className="hidden sm:block" /> not guesswork.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            RootTrace Ivory ingests your JUnit failures, correlates the evidence, and gives your team an
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

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-brand-blue">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-brand-blue-light/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-brand-blue">
              Why teams switch
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="transition-shadow hover:shadow-md">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                      <Icon />
                    </div>
                    <h3 className="mb-2 font-semibold text-ink">{feature.title}</h3>
                    <p className="text-sm text-muted">{feature.description}</p>
                  </Card>
                );
              })}
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
          RootTrace Ivory — Test Failure Investigator
        </div>
      </footer>
    </div>
  );
}
