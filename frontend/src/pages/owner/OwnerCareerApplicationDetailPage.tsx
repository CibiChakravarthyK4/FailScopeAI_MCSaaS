import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TraceRing } from '../../components/ui/TraceRing';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import {
  getCareerApplication,
  updateCareerApplicationStatus,
  downloadCareerApplicationResume,
  type CareerApplicationDetail,
} from '../../services/ownerService';

export function OwnerCareerApplicationDetailPage() {
  const { ownerLogout } = useOwnerAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<CareerApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCareerApplication(Number(id))
      .then(setApplication)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleLogout = () => {
    ownerLogout();
    navigate('/owner/login');
  };

  const handleMarkReviewed = async () => {
    if (!application) return;
    setIsUpdating(true);
    try {
      setApplication(await updateCareerApplicationStatus(application.id, 'reviewed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = async () => {
    if (!application) return;
    setIsDownloading(true);
    try {
      await downloadCareerApplicationResume(application.id, application.resume_original_filename);
    } finally {
      setIsDownloading(false);
    }
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

      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link to="/owner/careers" className="text-sm text-brand-blue hover:text-brand-blue-dark">
          Career applications
        </Link>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted">Loading...</p>
        ) : !application ? (
          <p className="mt-4 text-sm text-muted">Application not found.</p>
        ) : (
          <>
            <div className="mb-6 mt-2 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-ink">{application.name}</h1>
              <span className="rounded-md border border-line bg-brand-blue-light px-2 py-0.5 text-xs font-medium capitalize text-brand-blue">
                {application.status}
              </span>
            </div>

            <Card className="space-y-3">
              <dl className="divide-y divide-line text-sm">
                <div className="flex justify-between py-2">
                  <dt className="text-muted">Role</dt>
                  <dd className="text-ink">{application.role}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted">Email</dt>
                  <dd className="text-ink">{application.email}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted">Phone</dt>
                  <dd className="text-ink">{application.phone || '-'}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted">LinkedIn / portfolio</dt>
                  <dd className="text-ink">{application.links || '-'}</dd>
                </div>
              </dl>
              {application.note && (
                <div className="border-t border-line pt-3">
                  <p className="mb-1 text-sm font-medium text-ink">Note</p>
                  <p className="text-sm text-muted">{application.note}</p>
                </div>
              )}
              <div className="flex gap-3 border-t border-line pt-4">
                <Button fullWidth={false} className="px-4" onClick={handleDownload} isLoading={isDownloading}>
                  Download resume ({application.resume_original_filename})
                </Button>
                {application.status === 'new' && (
                  <Button
                    variant="secondary"
                    fullWidth={false}
                    className="px-4"
                    onClick={handleMarkReviewed}
                    isLoading={isUpdating}
                  >
                    Mark reviewed
                  </Button>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
