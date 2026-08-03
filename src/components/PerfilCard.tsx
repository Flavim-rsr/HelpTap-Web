import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Role } from '../types';
import { PERFIL_CONFIG } from '../styles/perfis';

export function PerfilCard({ perfil }: { perfil: Role }) {
  const cfg = PERFIL_CONFIG[perfil];
  const Icone = cfg.Icone;
  return (
    <Link
      to={`/login/${perfil}`}
      className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${cfg.gradiente} p-4 text-left text-white shadow-md transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-offset-2`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/20">
        <Icone aria-hidden className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{cfg.titulo}</span>
        <span className="block text-xs text-white/80">{cfg.descricao}</span>
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0" />
    </Link>
  );
}
