import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { getUsage, type Usage } from '../services/dashboardService';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function SettingsPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Usage &amp; settings</h1>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : usage ? (
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
        ) : (
          <p className="text-sm text-muted">No usage recorded yet.</p>
        )}
      </div>
    </PageWrapper>
  );
}
