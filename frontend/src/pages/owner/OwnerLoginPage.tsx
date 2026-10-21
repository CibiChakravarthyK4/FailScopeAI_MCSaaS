import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { useOwnerAuth } from '../../context/OwnerAuthContext';

// Deliberately a separate, unlinked route rather than reusing /login: the
// Platform Owner identity is a wholly separate table/token from tenant users
// (app/models/platform_owner.py), and keeping its sign-in on its own page
// keeps that separation obvious in the UI too, not just the backend.
export function OwnerLoginPage() {
  const { ownerLogin } = useOwnerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await ownerLogin(email, password, totpCode);
      navigate('/owner');
    } catch {
      setError('Invalid email, password or authentication code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Platform Owner sign-in</h1>
          <p className="mt-1 text-sm text-muted">Cross-tenant account and billing view</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Authentication code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6-digit code from your authenticator app"
              required
            />
            {error && <FormMessage>{error}</FormMessage>}
            <Button type="submit" isLoading={isLoading}>
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
