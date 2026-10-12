import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GoogleSignInButton } from './GoogleSignInButton';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(email, password, tenantName, fullName || undefined);
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
      {error && <p className="text-sm text-red-600">{error}</p>}
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
