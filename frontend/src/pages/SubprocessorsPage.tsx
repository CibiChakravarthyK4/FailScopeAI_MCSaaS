import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicPageHeader } from '../components/marketing/PublicPageHeader';
import { Container } from '../components/marketing/Container';
import { subprocessors } from '../config/subprocessors';
import { useSeo } from '../utils/useSeo';

export function SubprocessorsPage() {
  useSeo('Subprocessors', 'Who processes data on our behalf, and what they see.', '/subprocessors');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <PublicPageHeader
          label="Subprocessors"
          title="Who we share data with to run the service."
          subtitle="Referenced from our Privacy Policy - updated as this changes."
        />

        <section className="border-t border-line py-16 lg:py-24">
          <Container>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-iv-bg">
                    <th className="px-4 py-3 text-left font-medium text-ink">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-ink">Purpose</th>
                    <th className="px-4 py-3 text-left font-medium text-ink">Data processed</th>
                    <th className="px-4 py-3 text-left font-medium text-ink">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {subprocessors.map((row) => (
                    <tr key={row.name}>
                      <td className="px-4 py-3 align-top font-medium text-ink">{row.name}</td>
                      <td className="px-4 py-3 align-top text-muted">{row.purpose}</td>
                      <td className="px-4 py-3 align-top text-muted">{row.dataProcessed}</td>
                      <td className="px-4 py-3 align-top text-muted">{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
