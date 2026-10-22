import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { faqCategories } from '../config/faq';
import { useSeo } from '../utils/useSeo';
import { useStructuredData } from '../utils/useStructuredData';

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0 text-muted transition-transform group-open:rotate-180"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FaqPage() {
  useSeo('FAQ', 'Answers about data and privacy, how RootTrace Ivory works, accounts and plans, and integrations.', '/faq');

  // Native <details>/<summary> gives keyboard support (Enter/Space to
  // toggle, native focus handling) for free, rather than reimplementing
  // accordion behaviour by hand.
  useStructuredData('faq-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqCategories.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      }))
    ),
  });

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="FAQ"
          title="Questions, answered plainly."
          subtitle="If something here isn't built yet, we say so."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl space-y-10">
              {faqCategories.map((category) => (
                <div key={category.category}>
                  <h2 className="mb-4 text-lg font-semibold text-ink">{category.category}</h2>
                  <div className="divide-y divide-line rounded-lg border border-line">
                    {category.items.map((item) => (
                      <details key={item.question} className="group px-5 py-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                          {item.question}
                          <ChevronIcon />
                        </summary>
                        <p className="mt-3 text-sm text-muted">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
