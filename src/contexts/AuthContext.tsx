import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Sessao } from '../types';

const CHAVE_SESSAO = 'helptap.sessao';
export const CHAVE_DESTINO = 'helptap.destino';

interface AuthContextValue {
  sessao: Sessao | null;
  entrar: (s: Sessao) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function lerSessaoSalva(): Sessao | null {
  const salvo = sessionStorage.getItem(CHAVE_SESSAO);
  if (!salvo) return null;
  try {
    return JSON.parse(salvo) as Sessao;
  } catch {
    // valor corrompido em sessionStorage não deve derrubar a aplicação
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessaoSalva);

  const entrar = (s: Sessao) => {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
    setSessao(s);
  };

  const sair = () => {
    sessionStorage.removeItem(CHAVE_SESSAO);
    setSessao(null);
  };

  return <AuthContext.Provider value={{ sessao, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
