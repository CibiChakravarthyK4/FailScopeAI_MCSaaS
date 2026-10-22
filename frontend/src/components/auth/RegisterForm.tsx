import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { FormMessage } from '../ui/FormMessage';
import { GoogleSignInButton } from './GoogleSignInButton';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setTermsError(null);
    if (!acceptedTerms) {
      setTermsError('You must accept the Terms and Conditions and Privacy Policy to continue.');
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password, tenantName, acceptedTerms, fullName || undefined);
      navigate('/dashboard');
    } catch {
      setError('Could not create account. The email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Workspace name"
        value={tenantName}
        onChange={(e) => setTenantName(e.target.value)}
        placeholder="Acme QA"
        required
      />
      <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <Checkbox
        label={
          <>
            I agree to the{' '}
            <Link to="/terms" className="text-brand-blue hover:text-brand-blue-dark">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-brand-blue hover:text-brand-blue-dark">
              Privacy Policy
            </Link>
            .
          </>
        }
        checked={acceptedTerms}
        onChange={(e) => setAcceptedTerms(e.target.checked)}
        error={termsError ?? undefined}
      />
      {error && <FormMessage>{error}</FormMessage>}
      <Button type="submit" isLoading={isLoading}>
        Create account
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleSignInButton />
    </form>
  );
}
