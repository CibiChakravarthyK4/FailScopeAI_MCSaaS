import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { listFailureGroups } from '../services/diagnosisService';
import type { FailureGroup } from '../types';

export function GroupsPage() {
  const [groups, setGroups] = useState<FailureGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listFailureGroups()
      .then(setGroups)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Recurring failure groups</h1>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : groups.filter((g) => g.member_count > 0).length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No recurring groups yet. Run an investigation on a test case first.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-line p-0">
            {groups
              .filter((g) => g.member_count > 0)
              .map((group) => (
                <div key={group.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-ink">{group.title}</p>
                    <p className="text-sm text-muted">{new Date(group.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-md border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium text-brand-blue">
                    {group.member_count} test{group.member_count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
