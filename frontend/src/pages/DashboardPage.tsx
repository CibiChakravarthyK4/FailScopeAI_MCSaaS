import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/app/AppLayout';
import { PageContainer } from '../components/app/PageContainer';
import { PageHeader } from '../components/app/PageHeader';
import { KpiCard } from '../components/app/KpiCard';
import { GetStartedChecklist } from '../components/app/GetStartedChecklist';
import { EmptyState } from '../components/app/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getUnresolvedGroups, getMetrics, type GroupSummary, type Metrics } from '../services/dashboardService';
import { listRuns } from '../services/runService';
import type { Run } from '../types';

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 3 8l9 5 9-5-9-5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M3 12l9 5 9-5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M3 16l9 5 9-5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUnresolvedGroups(), getMetrics(), listRuns()])
      .then(([g, m, r]) => {
        setGroups(g);
        setMetrics(m);
        setRuns(r);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.email.split('@')[0] || 'there';
  const recentRuns = runs.slice(0, 5);

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader
          title={`Welcome, ${firstName}`}
          description="Track imported runs, review diagnoses and confirm defects."
        />

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <>
            {metrics && (
              <GetStartedChecklist
                steps={[
                  { label: 'Import your first run', done: metrics.runs_imported > 0, to: '/runs/new' },
                  { label: 'Review a diagnosis', done: metrics.reviewed > 0, to: '/review-queue' },
                  { label: 'Export a defect', done: metrics.exports_published > 0, to: '/review-queue' },
                ]}
              />
            )}

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                icon={ClockIcon}
                label="Pending review"
                value={metrics?.pending_review ?? 0}
                helperText="Diagnoses waiting for your review"
              />
              <KpiCard
                icon={CheckCircleIcon}
                label="Reviewed"
                value={metrics?.reviewed ?? 0}
                helperText="Diagnoses confirmed by a reviewer"
              />
              <KpiCard
                icon={TargetIcon}
                label="Reviewer agreement"
                value={
                  metrics?.reviewer_agreement_rate != null
                    ? `${Math.round(metrics.reviewer_agreement_rate * 100)}%`
                    : '—'
                }
                helperText="Suggested category accepted as-is"
              />
              <KpiCard
                icon={LayersIcon}
                label="Unresolved groups"
                value={groups.length}
                helperText="Recurring failures not yet resolved"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="mb-3 text-sm font-medium text-ink">Recent runs</p>
                {recentRuns.length === 0 ? (
                  <EmptyState
                    title="No runs imported yet. Import your first failed run to get started."
                    action={
                      <Link to="/runs/new">
                        <Button fullWidth={false} className="px-4">
                          Import run
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <Card className="divide-y divide-line p-0">
                    {recentRuns.map((run) => (
                      <Link
                        key={run.id}
                        to={`/runs/${run.id}`}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-4 hover:bg-brand-blue-light"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{run.external_run_id}</p>
                          <p className="truncate text-sm text-muted">
                            {run.environment ?? 'unspecified env'} · {new Date(run.created_at).toLocaleString()}
                          </p>
                        </div>
                        <StatusBadge status={run.status} />
                      </Link>
                    ))}
                  </Card>
                )}
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-ink">Unresolved failure groups</p>
                {groups.length === 0 ? (
                  <EmptyState title="No unresolved failure groups right now." />
                ) : (
                  <Card className="divide-y divide-line p-0">
                    {groups.map((g) => (
                      <div key={g.id} className="px-6 py-4">
                        <p className="font-medium text-ink">{g.title}</p>
                        <p className="text-sm text-muted">
                          {g.member_count} test{g.member_count === 1 ? '' : 's'}, {g.pending_count} pending review
                        </p>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </AppLayout>
  );
}
