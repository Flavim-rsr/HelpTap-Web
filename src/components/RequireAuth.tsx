import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  const location = useLocation();
  if (!sessao) {
    sessionStorage.setItem('helptap.destino', location.pathname);
    return <Navigate to="/" replace />;
  }
  return children;
}
