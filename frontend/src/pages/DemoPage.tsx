import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { submitDemoRequest, type TeamSize } from '../services/publicService';
import { useSeo } from '../utils/useSeo';

const TEAM_SIZES: { value: TeamSize; label: string }[] = [
  { value: '1-5', label: '1-5' },
  { value: '6-20', label: '6-20' },
  { value: '21-50', label: '21-50' },
  { value: '50+', label: '50+' },
];

const MAX_NOTE = 1000;

export function DemoPage() {
  useSeo('Request a Demo', 'See RootTrace Ivory in action - request a demo with our team.', '/demo');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState<TeamSize>('1-5');
  const [wantToSee, setWantToSee] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!company.trim()) next.company = 'Enter your company name.';
    if (!role.trim()) next.role = 'Enter your role.';
    if (!consent) next.consent = 'Please accept the Privacy Policy to continue.';
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submitDemoRequest({
        name,
        email,
        company,
        role,
        teamSize,
        wantToSee,
        preferredTime,
        consent,
        website,
      });
      setIsSubmitted(true);
    } catch {
      setSubmitError('Something went wrong sending your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Request a Demo"
          title="See RootTrace Ivory with your own failures."
          subtitle="Tell us a bit about your team and we'll set up a walkthrough."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-xl">
              <Card>
                {isSubmitted ? (
                  <FormMessage variant="success">
                    Thanks - we've received your request. A real person will reach out to schedule a time.
                  </FormMessage>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor="demo-website">Leave this field blank</label>
                      <input
                        id="demo-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>

                    <Input
                      label="Full name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={errors.name}
                    />
                    <Input
                      label="Work email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                    />
                    <Input
                      label="Company"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      error={errors.company}
                    />
                    <Input
                      label="Role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      error={errors.role}
                      placeholder="e.g. QA Lead"
                    />
                    <Select
                      label="Team size"
                      required
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value as TeamSize)}
                      options={TEAM_SIZES}
                    />
                    <Textarea
                      label="What do you want to see?"
                      helperText="Optional"
                      rows={4}
                      maxLength={MAX_NOTE}
                      showCounter
                      value={wantToSee}
                      onChange={(e) => setWantToSee(e.target.value)}
                    />
                    <Input
                      label="Preferred time"
                      helperText="Optional - e.g. weekday mornings IST"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    />
                    <Checkbox
                      label={
                        <>
                          I agree to the{' '}
                          <Link to="/privacy" className="text-brand-blue hover:text-brand-blue-dark">
                            Privacy Policy
                          </Link>
                          .
                        </>
                      }
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      error={errors.consent}
                    />

                    {submitError && <FormMessage>{submitError}</FormMessage>}

                    <Button type="submit" isLoading={isSubmitting}>
                      Request a demo
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
