import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { EmptyState } from '../components/app/EmptyState';
import { FileDropzone } from '../components/app/FileDropzone';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { listOpenRoles, submitCareerApplication, type CareerRole } from '../services/careersService';
import { useSeo } from '../utils/useSeo';

const GENERAL_APPLICATION = 'General application';
const MAX_NOTE = 1000;

const WHY_CARDS = [
  { title: 'Evidence over guesswork', description: 'We make decisions - product and otherwise - based on evidence, not opinion volume.' },
  { title: 'Small team, real ownership', description: "At this stage, what you build is what ships. There's no layer between your work and the product." },
  { title: 'Remote-friendly', description: 'We work asynchronously where we can and keep meetings deliberate.' },
  { title: 'Plain, direct communication', description: 'We say what we mean, including about what this role actually involves and where the company actually is.' },
];

const HIRING_STEPS = [
  { step: '1', title: 'Apply', description: 'Submit the form below with your resume and a short note.' },
  { step: '2', title: 'Conversation', description: "If there's a fit, we'll set up a conversation with the team." },
  { step: '3', title: 'Decision', description: "We'll let you know either way - we don't leave applicants hanging." },
];

export function CareersPage() {
  useSeo('Join our Team', 'Open roles at RootTrace Ivory, and how to apply.', '/careers');

  const [roles, setRoles] = useState<CareerRole[] | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState(GENERAL_APPLICATION);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [links, setLinks] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    listOpenRoles()
      .then(setRoles)
      .catch(() => setRoles([]));
  }, []);

  const scrollToForm = (presetRole?: string) => {
    if (presetRole) setRole(presetRole);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResumeChange = (files: File[]) => {
    const file = files[0] ?? null;
    setResume(file);
    if (!file) {
      setResumeError(null);
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      setResumeError('Only .pdf or .docx files are accepted.');
    } else if (file.size > 5 * 1024 * 1024) {
      setResumeError('File is larger than the 5 MB limit.');
    } else {
      setResumeError(null);
    }
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!resume) next.resume = 'Attach your resume.';
    if (!consent) next.consent = 'Please accept the Privacy Policy to continue.';
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0 || resumeError || !resume) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submitCareerApplication({ role, name, email, phone, links, note, consent, website, resume });
      setIsSubmitted(true);
    } catch {
      setSubmitError('Something went wrong sending your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Join our Team"
          title="Help us build a product teams actually trust."
          subtitle="We're small, direct, and evidence-driven - see if that's a fit for you."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">Why work with us</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {WHY_CARDS.map((card) => (
                <Card key={card.title} className="flex h-full flex-col">
                  <h3 className="mb-2 font-semibold text-ink">{card.title}</h3>
                  <p className="text-sm text-muted">{card.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-iv-bg py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">How we hire</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {HIRING_STEPS.map((s) => (
                <div key={s.step} className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-blue text-brand-blue">
                    {s.step}
                  </div>
                  <h3 className="mb-1 font-semibold text-ink">{s.title}</h3>
                  <p className="text-sm text-muted">{s.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">Open roles</h2>
            <div className="mx-auto mt-10 max-w-2xl">
              {roles === null ? (
                <p className="text-center text-sm text-muted">Loading...</p>
              ) : roles.length === 0 ? (
                <EmptyState
                  title="No open roles right now."
                  action={
                    <Button fullWidth={false} className="px-4" onClick={() => scrollToForm(GENERAL_APPLICATION)}>
                      Send a general application
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {roles.map((r) => (
                    <Card key={r.title}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-ink">{r.title}</h3>
                          <p className="text-sm text-muted">
                            {r.team} · {r.location} · {r.type}
                          </p>
                        </div>
                        <Button fullWidth={false} className="px-4" onClick={() => scrollToForm(r.title)}>
                          Apply
                        </Button>
                      </div>
                      <p className="mt-3 text-sm text-muted">{r.description}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>

        <section ref={formRef} className="border-t border-line bg-iv-bg py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">Apply</h2>
            <div className="mx-auto mt-10 max-w-xl">
              <Card>
                {isSubmitted ? (
                  <FormMessage variant="success">
                    Thanks for applying. We've received your application and a real person will review it.
                  </FormMessage>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor="careers-website">Leave this field blank</label>
                      <input
                        id="careers-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>

                    <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
                    <Input
                      label="Email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                    />
                    <Input
                      label="Phone"
                      helperText="Optional"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Select
                      label="Role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      options={[
                        ...(roles ?? []).map((r) => ({ value: r.title, label: r.title })),
                        { value: GENERAL_APPLICATION, label: GENERAL_APPLICATION },
                      ]}
                    />
                    <Input
                      label="LinkedIn or portfolio URL"
                      helperText="Optional"
                      value={links}
                      onChange={(e) => setLinks(e.target.value)}
                    />
                    <FileDropzone
                      label="Resume"
                      helperText=".pdf or .docx up to 5 MB"
                      accept=".pdf,.docx"
                      required
                      files={resume ? [resume] : []}
                      onFilesChange={handleResumeChange}
                      error={resumeError ?? errors.resume}
                    />
                    <Textarea
                      label="Short note"
                      helperText="Optional"
                      rows={4}
                      maxLength={MAX_NOTE}
                      showCounter
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <Checkbox
                      label={
                        <>
                          I agree to the{' '}
                          <Link to="/privacy" className="text-brand-blue hover:text-brand-blue-dark">
                            Privacy Policy
                          </Link>
                          . Applications are kept only as long as needed to consider them - see the Privacy Policy for
                          retention details.
                        </>
                      }
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      error={errors.consent}
                    />

                    {submitError && <FormMessage>{submitError}</FormMessage>}

                    <Button type="submit" isLoading={isSubmitting}>
                      Submit application
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
