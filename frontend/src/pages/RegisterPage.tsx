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
            FailScope <span className="text-brand-blue">AI</span>
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
      </div>
    </PageWrapper>
  );
}
