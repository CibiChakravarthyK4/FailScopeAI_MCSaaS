import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import {
  listTenants,
  getPlatformUsage,
  type TenantSummary,
  type PlatformUsage,
} from '../services/platformService';

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
}

export function PlatformDashboardPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [usage, setUsage] = useState<PlatformUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listTenants(), getPlatformUsage()])
      .then(([t, u]) => {
        setTenants(t);
        setUsage(u);
      })
      .catch(() => setError('You do not have platform owner access.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-1 text-xl font-semibold text-ink">Platform overview</h1>
        <p className="mb-8 text-sm text-muted">All workspaces on this deployment, across every tenant.</p>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : error ? (
          <Card>
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
              <MetricTile label="Tenants" value={String(usage?.tenant_count ?? 0)} />
              <MetricTile label="Total runs" value={String(usage?.total_runs ?? 0)} />
              <MetricTile label="Total diagnoses" value={String(usage?.total_diagnoses ?? 0)} />
              <MetricTile
                label="Storage used"
                value={`${((usage?.total_storage_bytes ?? 0) / (1024 * 1024)).toFixed(1)} MB`}
              />
              <MetricTile
                label="Model cost this period"
                value={`$${(usage?.total_cost_estimate_usd ?? 0).toFixed(2)}`}
              />
            </div>

            <h2 className="mb-3 text-sm font-medium text-ink">Workspaces</h2>
            <Card className="divide-y divide-line p-0">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-ink">{tenant.name}</p>
                    <p className="text-sm text-muted">
                      {tenant.slug} · {tenant.user_count} user{tenant.user_count === 1 ? '' : 's'} ·{' '}
                      {tenant.run_count} run{tenant.run_count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="rounded-md border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium capitalize text-brand-blue">
                    {tenant.plan}
                  </span>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
