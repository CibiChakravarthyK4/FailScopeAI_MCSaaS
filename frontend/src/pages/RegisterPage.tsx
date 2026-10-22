import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { RegisterForm } from '../components/auth/RegisterForm';

export function RegisterPage() {
  return (
    <PageWrapper className="flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">
            RootTrace <span className="text-brand-blue">Ivory</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Create your workspace</p>
        </div>
        <Card>
          <RegisterForm />
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-blue">
            Sign in
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
