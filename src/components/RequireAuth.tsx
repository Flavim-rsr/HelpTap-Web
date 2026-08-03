import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CHAVE_DESTINO, useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!sessao) {
      sessionStorage.setItem(CHAVE_DESTINO, location.pathname);
    }
  }, [sessao, location.pathname]);

  if (!sessao) {
    return <Navigate to="/" replace />;
  }
  return children;
}
