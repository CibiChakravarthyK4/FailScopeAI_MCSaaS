import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TraceRing } from '../../components/ui/TraceRing';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import {
  listClients,
  getOwnerUsage,
  getBillingReport,
  downloadBillingReportCsv,
  type ClientSummary,
  type OwnerUsage,
  type BillingReport,
} from '../../services/ownerService';

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
}

export function OwnerDashboardPage() {
  const { ownerLogout } = useOwnerAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [usage, setUsage] = useState<OwnerUsage | null>(null);
  const [billing, setBilling] = useState<BillingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    Promise.all([listClients(), getOwnerUsage(), getBillingReport()])
      .then(([c, u, b]) => {
        setClients(c);
        setUsage(u);
        setBilling(b);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    ownerLogout();
    navigate('/owner/login');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadBillingReportCsv();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageWrapper>
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="flex items-center gap-2 text-lg font-semibold text-ink">
            <TraceRing size={22} />
            RootTrace <span className="text-brand-blue">Ivory</span> · Platform Owner
          </p>
          <div className="flex items-center gap-3">
            <Link to="/owner/careers" className="text-sm font-medium text-brand-blue hover:text-brand-blue-dark">
              Career applications
            </Link>
            <Button variant="secondary" fullWidth={false} className="px-4 py-2" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-1 text-xl font-semibold text-ink">Platform overview</h1>
        <p className="mb-8 text-sm text-muted">
          Account, plan and billing data across every client. Test artifacts, logs and diagnoses are never shown
          here (CLAUDE.md Section 15).
        </p>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
              <MetricTile label="Clients" value={String(usage?.tenant_count ?? 0)} />
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

            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink">Billing report</h2>
              <Button variant="secondary" fullWidth={false} className="px-4" onClick={handleExport} isLoading={isExporting}>
                Export CSV
              </Button>
            </div>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricTile label="Revenue (active)" value={`$${(billing?.total_revenue_usd ?? 0).toFixed(2)}`} />
              <MetricTile label="Outstanding" value={`$${(billing?.outstanding_usd ?? 0).toFixed(2)}`} />
              <MetricTile label="Renewals due (30d)" value={String(billing?.renewals_due_count ?? 0)} />
              <MetricTile label="Expired" value={String(billing?.expired_count ?? 0)} />
            </div>

            <h2 className="mb-3 text-sm font-medium text-ink">Clients</h2>
            <Card className="divide-y divide-line p-0">
              {clients.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-ink">{c.name}</p>
                    <p className="text-sm text-muted">
                      {c.slug} · {c.admin_emails.join(', ') || 'no admin'} · {c.user_count} user
                      {c.user_count === 1 ? '' : 's'} · {c.usage_job_runs} run{c.usage_job_runs === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-md border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium capitalize text-brand-blue">
                      {c.plan}
                    </span>
                    <p className="mt-1 text-xs text-muted">
                      {c.billing_status}
                      {c.billing_price_usd != null ? ` · $${c.billing_price_usd.toFixed(2)}` : ''}
                      {c.billing_renewal_date ? ` · renews ${c.billing_renewal_date}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
