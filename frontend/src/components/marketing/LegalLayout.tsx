import type { ReactNode } from 'react';
import { Container } from './Container';
import { company } from '../../config/company';

export interface TocItem {
  id: string;
  label: string;
}

function DraftBanner() {
  if (!company.legal.isDraftForLegalReview) return null;
  return (
    <div className="mb-6 border-l-2 border-iv-blue-deep bg-iv-blue-50 px-4 py-3 text-sm text-iv-blue-deep">
      Draft for legal review - this page has not yet been reviewed by counsel and is not final.
    </div>
  );
}

export function LegalLayout({
  label,
  title,
  subtitle,
  version,
  effectiveDate,
  tocItems,
  children,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  version: string;
  effectiveDate: string;
  tocItems: TocItem[];
  children: ReactNode;
}) {
  return (
    <div className="py-16 lg:py-24">
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
          <div className="mx-auto w-full max-w-[760px] lg:mx-0">
            {label && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-blue">{label}</p>}
            <h1 className="text-3xl font-semibold text-ink lg:text-4xl">{title}</h1>
            {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
            <p className="mt-4 text-sm text-muted">
              Version {version} · Effective {effectiveDate}
            </p>

            <DraftBanner />

            <div className="prose-legal mt-8 space-y-8 text-ink">{children}</div>
          </div>

          <nav aria-label="Table of contents" className="hidden lg:block">
            <div className="sticky top-24 space-y-2 text-sm">
              {tocItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="block text-muted hover:text-ink">
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </Container>
    </div>
  );
}
