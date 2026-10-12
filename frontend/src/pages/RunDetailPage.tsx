import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
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
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : !run ? (
          <p className="text-sm text-muted">Run not found.</p>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-ink">{run.external_run_id}</h1>
                <p className="text-sm text-muted">{run.environment ?? 'unspecified env'}</p>
              </div>
              <StatusBadge status={run.status} />
            </div>

            {run.test_cases.length === 0 ? (
              <Card>
                <p className="text-sm text-muted">
                  {run.status === 'processing' || run.status === 'pending'
                    ? 'Still processing this run...'
                    : 'No failed test cases found.'}
                </p>
              </Card>
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
      </div>
    </PageWrapper>
  );
}
