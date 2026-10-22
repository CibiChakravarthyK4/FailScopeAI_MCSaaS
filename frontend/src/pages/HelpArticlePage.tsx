import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { Container } from '../components/marketing/Container';
import { Button } from '../components/ui/Button';
import { getHelpArticle } from '../utils/helpArticles';
import { submitHelpFeedback } from '../services/publicService';
import { useSeo } from '../utils/useSeo';

function WasThisHelpful({ slug }: { slug: string }) {
  const [answered, setAnswered] = useState(false);

  const handleAnswer = async (helpful: boolean) => {
    setAnswered(true);
    await submitHelpFeedback(slug, helpful).catch(() => {});
  };

  if (answered) {
    return <p className="text-sm text-muted">Thanks for the feedback.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm font-medium text-ink">Was this helpful?</p>
      <Button variant="secondary" fullWidth={false} className="px-4 py-1.5 text-sm" onClick={() => handleAnswer(true)}>
        Yes
      </Button>
      <Button variant="secondary" fullWidth={false} className="px-4 py-1.5 text-sm" onClick={() => handleAnswer(false)}>
        No
      </Button>
    </div>
  );
}

export function HelpArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getHelpArticle(slug) : undefined;

  useSeo(article?.title ?? 'Help Center', article?.summary ?? '', `/help/${slug ?? ''}`);

  if (!article) {
    return <Navigate to="/help" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <div className="py-16 lg:py-24">
          <Container>
            <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
              <div className="mx-auto w-full max-w-[760px] lg:mx-0">
                <Link to="/help" className="text-sm text-brand-blue hover:text-brand-blue-dark">
                  Help Center
                </Link>
                <h1 className="mt-3 text-3xl font-semibold text-ink">{article.title}</h1>
                <p className="mt-1 text-sm text-muted">Last updated {article.updated}</p>

                {/* Content is author-controlled Markdown shipped with the app, not
                    user input, so rendering it as HTML carries no XSS risk. */}
                <div
                  className="prose-help mt-8 space-y-4 text-ink [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:text-muted [&_li]:text-muted [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-iv-bg [&_pre]:p-4 [&_pre]:text-sm [&_a]:text-brand-blue"
                  dangerouslySetInnerHTML={{ __html: article.html }}
                />

                <div className="mt-10 border-t border-line pt-6">
                  <WasThisHelpful slug={article.slug} />
                </div>

                <p className="mt-6 text-sm text-muted">
                  Still stuck?{' '}
                  <Link to="/contact" className="text-brand-blue hover:text-brand-blue-dark">
                    Contact us
                  </Link>
                  .
                </p>
              </div>

              {article.headings.length > 0 && (
                <nav aria-label="On this page" className="hidden lg:block">
                  <div className="sticky top-24 space-y-2 text-sm">
                    {article.headings.map((h) => (
                      <a key={h.id} href={`#${h.id}`} className="block text-muted hover:text-ink">
                        {h.text}
                      </a>
                    ))}
                  </div>
                </nav>
              )}
            </div>
          </Container>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
