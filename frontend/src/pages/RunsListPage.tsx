import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/app/AppLayout';
import { PageContainer } from '../components/app/PageContainer';
import { PageHeader } from '../components/app/PageHeader';
import { EmptyState } from '../components/app/EmptyState';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { listRuns } from '../services/runService';
import type { Run, RunStatus } from '../types';

// Filtering/sorting/pagination here are client-side over the full run list -
// fine at this data volume (a pilot-stage product), but would need real
// server-side support (query params + a paginated endpoint) once a tenant's
// run history grows large enough that fetching it all up front doesn't scale.
const PAGE_SIZE = 10;

const STATUS_FILTERS: { label: string; value: RunStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
  { label: 'Partial', value: 'partial' },
];

export function RunsListPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');
  const [envFilter, setEnvFilter] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    listRuns()
      .then(setRuns)
      .finally(() => setIsLoading(false));
  }, []);

  const environments = useMemo(
    () => Array.from(new Set(runs.map((r) => r.environment).filter((e): e is string => !!e))),
    [runs]
  );

  const filtered = useMemo(() => {
    let result = runs;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) => r.external_run_id.toLowerCase().includes(q) || (r.build_id ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((r) => r.status === statusFilter);
    if (envFilter !== 'all') result = result.filter((r) => r.environment === envFilter);
    return [...result].sort((a, b) =>
      sort === 'newest'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [runs, search, statusFilter, envFilter, sort]);

  useEffect(() => setPage(1), [search, statusFilter, envFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRuns = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const importButton = (
    <Link to="/runs/new">
      <Button fullWidth={false} className="px-4">
        Import run
      </Button>
    </Link>
  );

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader title="Runs" description="All imported test runs for this workspace." action={importButton} />

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : runs.length === 0 ? (
          <EmptyState
            title="No runs imported yet. Drag and drop a JUnit XML file on the import page, or import one below."
            action={importButton}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search run ID or build..."
                aria-label="Search runs"
                className="w-full max-w-xs rounded-md border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 sm:w-auto"
              />
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      statusFilter === f.value
                        ? 'border-brand-blue bg-brand-blue-light text-brand-blue'
                        : 'border-line text-muted hover:text-ink'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {environments.length > 0 && (
                <select
                  value={envFilter}
                  onChange={(e) => setEnvFilter(e.target.value)}
                  aria-label="Filter by environment"
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-ink"
                >
                  <option value="all">All environments</option>
                  {environments.map((env) => (
                    <option key={env} value={env}>
                      {env}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
                aria-label="Sort runs"
                className="rounded-md border border-line px-3 py-1.5 text-sm text-ink sm:ml-auto"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="No runs match these filters." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-16 z-[5] bg-iv-bg text-xs font-medium uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Run</th>
                      <th className="px-4 py-3">Build</th>
                      <th className="px-4 py-3">Environment</th>
                      <th className="px-4 py-3">Failures</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Imported at</th>
                      <th className="px-4 py-3">Imported by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {pageRuns.map((run) => (
                      <tr key={run.id} className="hover:bg-brand-blue-light">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link to={`/runs/${run.id}`} className="font-medium text-ink hover:text-brand-blue">
                            {run.external_run_id}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{run.build_id ?? '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{run.environment ?? '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{run.failure_count}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {new Date(run.created_at).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{run.imported_by_email ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    fullWidth={false}
                    className="px-3 py-1.5 text-sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth={false}
                    className="px-3 py-1.5 text-sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </AppLayout>
  );
}
