import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TraceRing } from '../../components/ui/TraceRing';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import { listCareerApplications, type CareerApplicationSummary } from '../../services/ownerService';

export function OwnerCareersApplicationsPage() {
  const { ownerLogout } = useOwnerAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CareerApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listCareerApplications()
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    ownerLogout();
    navigate('/owner/login');
  };

  return (
    <PageWrapper>
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="flex items-center gap-2 text-lg font-semibold text-ink">
            <TraceRing size={22} />
            RootTrace <span className="text-brand-blue">Ivory</span> · Platform Owner
          </p>
          <Button variant="secondary" fullWidth={false} className="px-4 py-2" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/owner" className="text-sm text-brand-blue hover:text-brand-blue-dark">
          Platform overview
        </Link>
        <h1 className="mb-1 mt-2 text-xl font-semibold text-ink">Career applications</h1>
        <p className="mb-8 text-sm text-muted">
          Never shown to tenants or any other role. Every view and download here is audit-logged (C05).
        </p>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : applications.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No applications yet.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-line p-0">
            {applications.map((a) => (
              <Link
                key={a.id}
                to={`/owner/careers/${a.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-brand-blue-light"
              >
                <div>
                  <p className="font-medium text-ink">{a.name}</p>
                  <p className="text-sm text-muted">
                    {a.role} · {a.email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-md border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium capitalize text-brand-blue">
                    {a.status}
                  </span>
                  <p className="mt-1 text-xs text-muted">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
