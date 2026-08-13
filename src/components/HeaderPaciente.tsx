import { useState } from 'react';
import { Calendar, MapPin, Phone, UserRound } from 'lucide-react';
import { telefoneInternacional } from '../utils/formato';

interface Props {
  nome: string;
  idade?: number;
  telefoneResponsavel?: string;
  fotoUrl?: string;
}

export function HeaderPaciente({ nome, idade, telefoneResponsavel, fotoUrl }: Props) {
  const [estadoEnvio, setEstadoEnvio] = useState<'parado' | 'localizando' | 'erro'>('parado');

  // Abre o WhatsApp do contato de emergência com a posição atual do leitor
  // já digitada (link wa.me). O envio final é confirmado pela pessoa.
  function enviarLocalizacao() {
    if (!telefoneResponsavel || !('geolocation' in navigator)) {
      setEstadoEnvio('erro');
      return;
    }
    setEstadoEnvio('localizando');
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const { latitude, longitude } = posicao.coords;
        const mapa = `https://maps.google.com/?q=${latitude},${longitude}`;
        const texto =
          `Emergência: estou prestando socorro a ${nome} pelo HelpTap. `
          + `Localização atual: ${mapa}`;
        const numero = telefoneInternacional(telefoneResponsavel);
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank');
        setEstadoEnvio('parado');
      },
      () => setEstadoEnvio('erro'),
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
      <div className="flex flex-wrap justify-center gap-2">
        {telefoneResponsavel && (
          <a
            href={`tel:+${telefoneInternacional(telefoneResponsavel)}`}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <Phone aria-hidden className="size-4" />
            Ligar Responsável
          </a>
        )}
        {telefoneResponsavel && (
          <button
            onClick={enviarLocalizacao}
            aria-live="polite"
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            disabled={estadoEnvio === 'localizando'}
          >
            <MapPin aria-hidden className="size-4" />
            {estadoEnvio === 'localizando' ? 'Obtendo localização…' : 'Enviar Localização'}
          </button>
        )}
      </div>
      {estadoEnvio === 'erro' && (
        <p className="text-xs text-red-600">
          Não foi possível obter sua localização. Verifique a permissão do navegador.
        </p>
      )}
    </header>
  );
}
