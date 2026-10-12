import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { listRuns } from '../services/runService';
import type { Run } from '../types';

export function RunsListPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listRuns()
      .then(setRuns)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">Runs</h1>
          <Link to="/runs/new">
            <Button className="w-auto px-4">Import run</Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : runs.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No runs imported yet.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-line p-0">
            {runs.map((run) => (
              <Link
                key={run.id}
                to={`/runs/${run.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-brand-blue-light"
              >
                <div>
                  <p className="font-medium text-ink">{run.external_run_id}</p>
                  <p className="text-sm text-muted">
                    {run.environment ?? 'unspecified env'} · {new Date(run.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={run.status} />
              </Link>
            ))}
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
