import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { LoginForm } from '../components/auth/LoginForm';
import { OAuthErrorBanner } from '../components/auth/OAuthErrorBanner';

export function LoginPage() {
  return (
    <PageWrapper className="flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">
            RootTrace <span className="text-brand-blue">Ivory</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to investigate test failures</p>
        </div>
        <OAuthErrorBanner />
        <Card>
          <LoginForm />
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-blue">
            Create one
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-muted">
          <Link to="/privacy" className="hover:text-ink">
            Privacy Policy
          </Link>
          {' · '}
          <Link to="/terms" className="hover:text-ink">
            Terms and Conditions
          </Link>
          {' · '}
          <Link to="/help" className="hover:text-ink">
            Help Center
          </Link>
        </p>
      </div>
    </PageWrapper>
  );
}
