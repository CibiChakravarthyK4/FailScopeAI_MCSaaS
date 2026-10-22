import { useState, type FormEvent } from 'react';
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
import { Link } from 'react-router-dom';
import { submitContact, type ContactTopic } from '../services/publicService';
import { company } from '../config/company';
import { useSeo } from '../utils/useSeo';

const TOPICS: { value: ContactTopic; label: string }[] = [
  { value: 'product_question', label: 'Product question' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'security_or_privacy', label: 'Security or privacy' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
];

const MIN_MESSAGE = 20;
const MAX_MESSAGE = 2000;

export function ContactPage() {
  useSeo('Contact Us', "Have a query? We're just a message away - reach the RootTrace Ivory team.", '/contact');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [topic, setTopic] = useState<ContactTopic>('product_question');
  const [message, setMessage] = useState('');
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
    if (message.trim().length < MIN_MESSAGE) next.message = `Message must be at least ${MIN_MESSAGE} characters.`;
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
      await submitContact({ name, email, company: companyName, topic, message, consent, website });
      setIsSubmitted(true);
    } catch {
      setSubmitError('Something went wrong sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Contact Us"
          title="Have a Query? We're Just a Message Away"
          subtitle="Tell us what you need and the right person on our team will get back to you."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
              <Card>
                {isSubmitted ? (
                  <FormMessage variant="success">
                    Thanks for reaching out. We've received your message and will get back to you.
                  </FormMessage>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Honeypot: real visitors never see this field. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor="website">Leave this field blank</label>
                      <input
                        id="website"
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
                      helperText="Optional"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <Select
                      label="Topic"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as ContactTopic)}
                      options={TOPICS}
                    />
                    <Textarea
                      label="Message"
                      required
                      rows={5}
                      minLength={MIN_MESSAGE}
                      maxLength={MAX_MESSAGE}
                      showCounter
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      error={errors.message}
                      helperText={!errors.message ? `Between ${MIN_MESSAGE} and ${MAX_MESSAGE} characters.` : undefined}
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

                    <Button type="submit" fullWidth={false} className="px-6" isLoading={isSubmitting}>
                      Send message
                    </Button>
                  </form>
                )}
              </Card>

              <div>
                <h2 className="mb-4 text-lg font-semibold text-ink">Other ways to reach us</h2>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-muted">Support</dt>
                    <dd className="font-medium text-ink">{company.supportEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Sales</dt>
                    <dd className="font-medium text-ink">{company.salesEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Phone</dt>
                    <dd className="font-medium text-ink">{company.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Address</dt>
                    <dd className="font-medium text-ink">{company.address}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Working hours</dt>
                    <dd className="font-medium text-ink">{company.workingHours}</dd>
                  </div>
                </dl>
                <div className="mt-8 rounded-lg border border-line bg-iv-bg p-4">
                  <p className="text-sm font-medium text-ink">What happens next</p>
                  <p className="mt-1 text-sm text-muted">
                    A real person reads every message. We'll reply from the email address you gave us.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
