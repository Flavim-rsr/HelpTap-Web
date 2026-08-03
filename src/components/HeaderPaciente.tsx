import { useState } from 'react';
import { Calendar, MapPin, Phone, UserRound } from 'lucide-react';

interface Props {
  nome: string;
  idade: number;
  telefoneResponsavel?: string;
}

export function HeaderPaciente({ nome, idade, telefoneResponsavel }: Props) {
  const [enviada, setEnviada] = useState(false);
  return (
    <header className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand/10">
        <UserRound aria-hidden className="size-8 text-brand" />
      </span>
      <div>
        <h1 className="text-xl font-bold">{nome}</h1>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-slate-500">
          <Calendar aria-hidden className="size-4" />
          {idade} anos
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {telefoneResponsavel && (
          <a
            href={`tel:${telefoneResponsavel.replace(/\D/g, '')}`}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <Phone aria-hidden className="size-4" />
            Ligar Responsável
          </a>
        )}
        <button
          onClick={() => setEnviada(true)}
          aria-live="polite"
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          <MapPin aria-hidden className="size-4" />
          {enviada ? 'Localização enviada ✓' : 'Enviar Localização'}
        </button>
      </div>
    </header>
  );
}
