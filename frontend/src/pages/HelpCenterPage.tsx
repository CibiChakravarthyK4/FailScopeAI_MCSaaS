import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { Card } from '../components/ui/Card';
import { helpArticles } from '../utils/helpArticles';
import { useSeo } from '../utils/useSeo';

export function HelpCenterPage() {
  useSeo('Help Center', 'Guides for importing runs, reading diagnoses, reviewing defects and managing roles.', '/help');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return helpArticles;
    return helpArticles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Help Center"
          title="Find your way around RootTrace Ivory."
          subtitle="Guides for importing runs, reading diagnoses, and managing your workspace."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="mx-auto max-w-2xl">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search help articles"
                className="mb-8 w-full rounded-md border border-line px-4 py-2.5 text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />

              {filtered.length === 0 ? (
                <p className="text-sm text-muted">No articles match "{query}".</p>
              ) : (
                <div className="space-y-4">
                  {filtered.map((article) => (
                    <Link key={article.slug} to={`/help/${article.slug}`}>
                      <Card className="hover:bg-brand-blue-light/40">
                        <h2 className="font-semibold text-ink">{article.title}</h2>
                        <p className="mt-1 text-sm text-muted">{article.summary}</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              <p className="mt-10 text-center text-sm text-muted">
                Can't find what you're looking for?{' '}
                <Link to="/contact" className="text-brand-blue hover:text-brand-blue-dark">
                  Contact us
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
