import { useState } from 'react';
import { Calendar, MapPin, Phone, UserRound } from 'lucide-react';
import { telefoneInternacional } from '../utils/formato';
import type { ContatoEmergencia } from '../types';

interface Props {
  nome: string;
  idade?: number;
  contatos?: ContatoEmergencia[];
  fotoUrl?: string;
}

export function HeaderPaciente({ nome, idade, contatos = [], fotoUrl }: Props) {
  // Índice do contato cuja localização está sendo obtida (null = nenhum).
  const [enviandoPara, setEnviandoPara] = useState<number | null>(null);
  const [erroLocalizacao, setErroLocalizacao] = useState(false);

  // Abre o WhatsApp do contato escolhido com a posição atual do leitor
  // já digitada (link wa.me). O envio final é confirmado pela pessoa.
  function enviarLocalizacao(indice: number) {
    const contato = contatos[indice];
    if (!contato || !('geolocation' in navigator)) {
      setErroLocalizacao(true);
      return;
    }
    setErroLocalizacao(false);
    setEnviandoPara(indice);
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const { latitude, longitude } = posicao.coords;
        const mapa = `https://maps.google.com/?q=${latitude},${longitude}`;
        const texto =
          `Emergência: estou prestando socorro a ${nome} pelo HelpTap. `
          + `Localização atual: ${mapa}`;
        const numero = telefoneInternacional(contato.telefone);
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank');
        setEnviandoPara(null);
      },
      () => {
        setErroLocalizacao(true);
        setEnviandoPara(null);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <header className="flex flex-col items-center gap-3 py-6 text-center">
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={`Foto de ${nome}`}
          className="size-20 rounded-full object-cover shadow-sm"
        />
      ) : (
        <span className="grid size-16 place-items-center rounded-full bg-brand/10">
          <UserRound aria-hidden className="size-8 text-brand" />
        </span>
      )}
      <div>
        <h1 className="text-xl font-bold">{nome}</h1>
        {idade !== undefined && (
          <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-slate-500">
            <Calendar aria-hidden className="size-4" />
            {idade} anos
          </p>
        )}
      </div>
      {contatos.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {contatos.map((contato, indice) => (
            <div
              key={`${contato.telefone}-${indice}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold">{contato.nome}</p>
                {contatos.length > 1 && (
                  <p className="text-xs text-slate-500">
                    {indice === 0 ? 'Contato principal' : 'Contato alternativo'}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={`tel:+${telefoneInternacional(contato.telefone)}`}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  <Phone aria-hidden className="size-4" />
                  Ligar
                </a>
                <button
                  onClick={() => enviarLocalizacao(indice)}
                  aria-live="polite"
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={enviandoPara !== null}
                >
                  <MapPin aria-hidden className="size-4" />
                  {enviandoPara === indice ? 'Localizando…' : 'Localização'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {erroLocalizacao && (
        <p className="text-xs text-red-600">
          Não foi possível obter sua localização. Verifique a permissão do navegador.
        </p>
      )}
    </header>
  );
}
