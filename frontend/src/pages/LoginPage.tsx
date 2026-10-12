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
            FailScope <span className="text-brand-blue">AI</span>
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
      </div>
    </PageWrapper>
  );
}
