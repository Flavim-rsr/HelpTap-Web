import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { DESTINATION_KEY, useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!session) {
      sessionStorage.setItem(DESTINATION_KEY, location.pathname);
    }
  }, [session, location.pathname]);

  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}
