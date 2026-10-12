import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { getUnresolvedGroups, getMetrics, type GroupSummary, type Metrics } from '../services/dashboardService';

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUnresolvedGroups(), getMetrics()])
      .then(([g, m]) => {
        setGroups(g);
        setMetrics(m);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-1 text-xl font-semibold text-ink">Welcome, {user?.full_name ?? user?.email}</h1>
        <p className="mb-8 text-sm text-muted">AI hypotheses are shown separately from reviewer-confirmed defects.</p>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricTile label="Pending review" value={String(metrics?.pending_review ?? 0)} />
              <MetricTile label="Reviewed" value={String(metrics?.reviewed ?? 0)} />
              <MetricTile
                label="Reviewer agreement"
                value={
                  metrics?.reviewer_agreement_rate != null
                    ? `${Math.round(metrics.reviewer_agreement_rate * 100)}%`
                    : '—'
                }
              />
              <MetricTile label="Unresolved groups" value={String(groups.length)} />
            </div>

            <h2 className="mb-3 text-sm font-medium text-ink">Unresolved failure groups</h2>
            {groups.length === 0 ? (
              <Card>
                <p className="text-sm text-muted">No unresolved failure groups. Import a run to get started.</p>
              </Card>
            ) : (
              <Card className="divide-y divide-line p-0">
                {groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-ink">{g.title}</p>
                      <p className="text-sm text-muted">{g.member_count} test(s), {g.pending_count} pending review</p>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            <Link to="/runs" className="mt-6 inline-block text-sm font-medium text-brand-blue">
              View all runs →
            </Link>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
