import { useEffect, useState } from 'react';
import { AppLayout } from '../components/app/AppLayout';
import { PageContainer } from '../components/app/PageContainer';
import { PageHeader } from '../components/app/PageHeader';
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
    <AppLayout>
      <PageContainer>
        <PageHeader title="Recurring failure groups" description="Failures that keep recurring across test cases and runs." />

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
      </PageContainer>
    </AppLayout>
  );
}
