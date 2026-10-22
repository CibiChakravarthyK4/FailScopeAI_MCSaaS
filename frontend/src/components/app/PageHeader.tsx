import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface Breadcrumb {
  label: string;
  to?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  action,
}: {
  breadcrumbs?: Breadcrumb[];
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-muted">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {b.to ? (
                  <Link to={b.to} className="hover:text-ink">
                    {b.label}
                  </Link>
                ) : (
                  <span>{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
