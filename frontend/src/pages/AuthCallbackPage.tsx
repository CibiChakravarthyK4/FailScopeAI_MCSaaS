import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) {
      navigate('/login');
      return;
    }
    setTokens(accessToken, refreshToken)
      .then(() => navigate('/dashboard'))
      .catch(() => navigate('/login'));
  }, [params, navigate, setTokens]);

  return <div className="flex min-h-screen items-center justify-center text-muted">Signing you in...</div>;
}
