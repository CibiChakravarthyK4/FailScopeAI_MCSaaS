import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '../components/app/AppLayout';
import { PageContainer } from '../components/app/PageContainer';
import { PageHeader } from '../components/app/PageHeader';
import { EmptyState } from '../components/app/EmptyState';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getRun } from '../services/runService';
import type { RunDetail } from '../types';

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!runId) return;
    getRun(Number(runId))
      .then(setRun)
      .finally(() => setIsLoading(false));
  }, [runId]);

  return (
    <AppLayout>
      <PageContainer>
        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : !run ? (
          <p className="text-sm text-muted">Run not found.</p>
        ) : (
          <>
            <PageHeader
              breadcrumbs={[{ label: 'Runs', to: '/runs' }, { label: run.external_run_id }]}
              title={run.external_run_id}
              description={run.environment ?? 'unspecified env'}
              action={<StatusBadge status={run.status} />}
            />

            {run.test_cases.length === 0 ? (
              <EmptyState
                title={
                  run.status === 'processing' || run.status === 'pending'
                    ? 'Still processing this run...'
                    : 'No failed test cases found.'
                }
              />
            ) : (
              <Card className="divide-y divide-line p-0">
                {run.test_cases.map((tc) => (
                  <Link
                    key={tc.id}
                    to={`/runs/${run.id}/tests/${tc.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-brand-blue-light"
                  >
                    <div>
                      <p className="font-medium text-ink">{tc.name}</p>
                      <p className="text-sm text-muted">{tc.classname}</p>
                    </div>
                    <StatusBadge status={tc.status} />
                  </Link>
                ))}
              </Card>
            )}
          </>
        )}
      </PageContainer>
    </AppLayout>
  );
}
