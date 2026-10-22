import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { acceptLegal } from '../services/authService';

// Reached after sign-in (any method) when the signed-in user hasn't accepted
// the current Terms/Privacy version yet - most often a Google sign-in, which
// has no form step to show the checkbox at account-creation time, or an
// existing user after a material wording change (CLAUDE.md Section 17).
export function AcceptTermsPage() {
  const { user, isLoading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.needs_legal_acceptance) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleContinue = async () => {
    if (!accepted) {
      setError('Please accept the Terms and Conditions and Privacy Policy to continue.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await acceptLegal();
      await refreshUser();
      navigate('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Updated terms</h1>
          <p className="mt-1 text-sm text-muted">Please review and accept before continuing.</p>
        </div>
        <Card>
          <Checkbox
            label={
              <>
                I agree to the{' '}
                <Link to="/terms" className="text-brand-blue hover:text-brand-blue-dark" target="_blank">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-brand-blue hover:text-brand-blue-dark" target="_blank">
                  Privacy Policy
                </Link>
                .
              </>
            }
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          {error && (
            <div className="mt-3">
              <FormMessage>{error}</FormMessage>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={() => logout()}>
              Sign out
            </Button>
            <Button onClick={handleContinue} isLoading={isSubmitting}>
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
