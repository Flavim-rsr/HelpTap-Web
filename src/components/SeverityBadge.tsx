import type { Severity } from '../types';

const COLORS: Record<Severity, string> = {
  Critica: 'bg-red-600 text-white',
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-amber-100 text-amber-700',
  Baixa: 'bg-emerald-100 text-emerald-700',
};

const LABELS: Record<Severity, string> = {
  Critica: 'Crítica',
  Alta: 'Alta',
  Media: 'Média',
  Baixa: 'Baixa',
};

export function SeverityBadge({ level }: { level: Severity }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLORS[level]}`}>
      {LABELS[level]}
    </span>
  );
}
