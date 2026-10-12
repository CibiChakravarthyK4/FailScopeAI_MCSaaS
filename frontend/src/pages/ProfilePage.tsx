import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Profile</h1>
        <Card className="space-y-3">
          <div>
            <p className="text-sm text-muted">Email</p>
            <p className="text-ink">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Full name</p>
            <p className="text-ink">{user?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Role</p>
            <p className="capitalize text-ink">{user?.role}</p>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
