import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Session } from '../types';

const SESSION_KEY = 'helptap.sessao';
export const DESTINATION_KEY = 'helptap.destino';

interface AuthContextValue {
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): Session | null {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Session;
  } catch {
    // valor corrompido em sessionStorage não deve derrubar a aplicação
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readStoredSession);

  const signIn = (s: Session) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const signOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
