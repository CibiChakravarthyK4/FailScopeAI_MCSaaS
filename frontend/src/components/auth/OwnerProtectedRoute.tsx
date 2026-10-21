import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useOwnerAuth } from '../../context/OwnerAuthContext';

export function OwnerProtectedRoute({ children }: { children: ReactNode }) {
  const { isOwnerSignedIn } = useOwnerAuth();

  if (!isOwnerSignedIn) {
    return <Navigate to="/owner/login" replace />;
  }
  return <>{children}</>;
}
