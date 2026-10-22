import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { getUsage, type Usage } from '../services/dashboardService';
import { getBillingStatus, startCheckout, type BillingStatus } from '../services/billingService';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function SettingsPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getUsage(), getBillingStatus().catch(() => null)])
      .then(([u, b]) => {
        setUsage(u);
        setBilling(b);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const url = await startCheckout();
      window.location.href = url;
    } catch {
      setCheckoutError('Could not start checkout. Please try again later.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Usage &amp; settings</h1>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : usage ? (
          <>
            <Card className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Plan</p>
                <span className="rounded-md border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium capitalize text-brand-blue">
                  {usage.plan}
                </span>
              </div>

              {billing?.configured ? (
                usage.plan !== 'pro' ? (
                  <Button fullWidth={false} className="px-4" onClick={handleUpgrade} isLoading={isCheckingOut}>
                    Upgrade to Pro
                  </Button>
                ) : (
                  <p className="text-sm text-muted">You're on the Pro plan.</p>
                )
              ) : (
                <p className="text-sm text-muted">Billing isn't set up for this workspace yet.</p>
              )}
              {checkoutError && <FormMessage>{checkoutError}</FormMessage>}
            </Card>

            <Card className="space-y-3">
              <p className="text-sm text-muted">Period: {usage.period}</p>
              <div className="flex justify-between">
                <span className="text-sm text-ink">Model cost this period</span>
                <span className="text-sm font-medium text-ink">
                  ${usage.cost_estimate_usd.toFixed(4)} / ${usage.cost_ceiling_usd.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-brand-blue"
                  style={{ width: `${Math.min(100, (usage.cost_estimate_usd / usage.cost_ceiling_usd) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm text-ink">Investigations run</span>
                <span className="text-sm font-medium text-ink">{usage.jobs_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ink">Tokens in / out</span>
                <span className="text-sm font-medium text-ink">
                  {usage.model_tokens_in} / {usage.model_tokens_out}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-sm text-ink">Storage used</span>
                <span className="text-sm font-medium text-ink">
                  {formatBytes(usage.total_storage_bytes)} / {formatBytes(usage.storage_quota_bytes)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-brand-blue"
                  style={{
                    width: `${Math.min(100, (usage.total_storage_bytes / usage.storage_quota_bytes) * 100)}%`,
                  }}
                />
              </div>
            </Card>
          </>
        ) : (
          <p className="text-sm text-muted">No usage recorded yet.</p>
        )}
      </div>
    </PageWrapper>
  );
}
