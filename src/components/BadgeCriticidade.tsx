import type { Criticidade } from '../types';

const CORES: Record<Criticidade, string> = {
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-amber-100 text-amber-700',
  Baixa: 'bg-emerald-100 text-emerald-700',
};

const ROTULOS: Record<Criticidade, string> = { Alta: 'Alta', Media: 'Média', Baixa: 'Baixa' };

export function BadgeCriticidade({ nivel }: { nivel: Criticidade }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CORES[nivel]}`}>
      {ROTULOS[nivel]}
    </span>
  );
}
