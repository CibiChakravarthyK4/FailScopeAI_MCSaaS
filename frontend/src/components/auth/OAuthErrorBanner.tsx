import { useSearchParams } from 'react-router-dom';

const MESSAGES: Record<string, string> = {
  google_oauth_not_configured: 'Google sign-in is not set up for this workspace yet. Please use email and password instead.',
};

export function OAuthErrorBanner() {
  const [params] = useSearchParams();
  const error = params.get('error');
  if (!error) return null;

  const message = MESSAGES[error] ?? 'Sign-in with that provider failed. Please use email and password instead.';

  return (
    <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}
    </div>
  );
}
