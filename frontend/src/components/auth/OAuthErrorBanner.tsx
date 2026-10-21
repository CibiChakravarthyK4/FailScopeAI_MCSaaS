import { useSearchParams } from 'react-router-dom';
import { FormMessage } from '../ui/FormMessage';

const MESSAGES: Record<string, string> = {
  google_oauth_not_configured: 'Google sign-in is not set up for this workspace yet. Please use email and password instead.',
};

export function OAuthErrorBanner() {
  const [params] = useSearchParams();
  const error = params.get('error');
  if (!error) return null;

  const message = MESSAGES[error] ?? 'Sign-in with that provider failed. Please use email and password instead.';

  return (
    <div className="mb-6">
      <FormMessage variant="warning">{message}</FormMessage>
    </div>
  );
}
