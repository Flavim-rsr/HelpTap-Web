import type { ReactNode } from 'react';
import type React from 'react';

interface Props {
  titulo: string;
  Icone: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}

export function CardSecao({ titulo, Icone, children }: Props) {
  return (
    <section aria-label={titulo} className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icone aria-hidden className="size-4 text-brand" />
        {titulo}
      </h2>
      {children}
    </section>
  );
}
