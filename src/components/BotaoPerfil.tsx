import type { ButtonHTMLAttributes } from 'react';
import type { Role } from '../types';
import { PERFIL_CONFIG } from '../styles/perfis';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  perfil: Role;
}

export function BotaoPerfil({ perfil, children, ...props }: Props) {
  const cfg = PERFIL_CONFIG[perfil];
  return (
    <button
      className={`w-full rounded-lg bg-gradient-to-r ${cfg.gradiente} px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
}
