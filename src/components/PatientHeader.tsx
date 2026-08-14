import { useState } from 'react';
import { Calendar, MapPin, Phone, UserRound } from 'lucide-react';
import { internationalPhone } from '../utils/format';
import type { EmergencyContact } from '../types';

interface Props {
  name: string;
  age?: number;
  contacts?: EmergencyContact[];
  photoUrl?: string;
}

export function PatientHeader({ name, age, contacts = [], photoUrl }: Props) {
  // Índice do contato cuja localização está sendo obtida (null = nenhum).
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);

  // Abre o WhatsApp do contato escolhido com a posição atual do leitor
  // já digitada (link wa.me). O envio final é confirmado pela pessoa.
  function sendLocation(index: number) {
    const contact = contacts[index];
    if (!contact || !('geolocation' in navigator)) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    setSendingTo(index);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = `https://maps.google.com/?q=${latitude},${longitude}`;
        const text =
          `Emergência: estou prestando socorro a ${name} pelo HelpTap. `
          + `Localização atual: ${map}`;
        const number = internationalPhone(contact.phone);
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
        setSendingTo(null);
      },
      () => {
        setLocationError(true);
        setSendingTo(null);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <header className="flex flex-col items-center gap-3 py-6 text-center">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`Foto de ${name}`}
          className="size-20 rounded-full object-cover shadow-sm"
        />
      ) : (
        <span className="grid size-16 place-items-center rounded-full bg-brand/10">
          <UserRound aria-hidden className="size-8 text-brand" />
        </span>
      )}
      <div>
        <h1 className="text-xl font-bold">{name}</h1>
        {age !== undefined && (
          <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-slate-500">
            <Calendar aria-hidden className="size-4" />
            {age} anos
          </p>
        )}
      </div>
      {contacts.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {contacts.map((contact, index) => (
            <div
              key={`${contact.phone}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold">{contact.name}</p>
                {contacts.length > 1 && (
                  <p className="text-xs text-slate-500">
                    {index === 0 ? 'Contato principal' : 'Contato alternativo'}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={`tel:+${internationalPhone(contact.phone)}`}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  <Phone aria-hidden className="size-4" />
                  Ligar
                </a>
                <button
                  onClick={() => sendLocation(index)}
                  aria-live="polite"
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={sendingTo !== null}
                >
                  <MapPin aria-hidden className="size-4" />
                  {sendingTo === index ? 'Localizando…' : 'Localização'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {locationError && (
        <p className="text-xs text-red-600">
          Não foi possível obter sua localização. Verifique a permissão do navegador.
        </p>
      )}
    </header>
  );
}
