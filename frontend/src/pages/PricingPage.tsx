import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { pricingPlans, comparisonRows, billingFaq } from '../config/pricing';
import { useSeo } from '../utils/useSeo';

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-blue">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PricingPage() {
  useSeo('Pricing', 'Pilot, Team and Enterprise plans for RootTrace Ivory. Contact us for pricing.', '/pricing');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Pricing"
          title="Plans that grow with your team."
          subtitle="Billing is arranged with our team during the pilot - contact us for pricing."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex h-full flex-col ${plan.highlighted ? 'border-brand-blue' : ''}`}
                >
                  <h2 className="text-xl font-semibold text-ink">{plan.name}</h2>
                  <p className="mt-2 text-sm text-muted">{plan.tagline}</p>
                  <p className="mt-6 text-lg font-semibold text-ink">Contact us for pricing</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.ctaTo} className="mt-6 block">
                    <Button variant={plan.highlighted ? 'primary' : 'secondary'}>{plan.ctaLabel}</Button>
                  </Link>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-iv-bg py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">Compare plans</h2>
            <div className="mt-10 overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 text-left font-medium text-ink">Feature</th>
                    <th className="px-4 py-3 text-center font-medium text-ink">Pilot</th>
                    <th className="px-4 py-3 text-center font-medium text-ink">Team</th>
                    <th className="px-4 py-3 text-center font-medium text-ink">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <td className="px-4 py-3 text-ink">{row.feature}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex">{row.pilot ? <CheckIcon /> : <DashIcon />}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex">{row.team ? <CheckIcon /> : <DashIcon />}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex">{row.enterprise ? <CheckIcon /> : <DashIcon />}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <h2 className="text-center text-2xl font-semibold text-ink">Billing FAQ</h2>
            <div className="mx-auto mt-8 max-w-2xl space-y-4">
              {billingFaq.map((item) => (
                <Card key={item.question}>
                  <p className="font-medium text-ink">{item.question}</p>
                  <p className="mt-2 text-sm text-muted">{item.answer}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
