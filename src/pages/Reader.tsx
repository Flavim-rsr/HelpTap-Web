import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Nfc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { IconInput } from '../components/IconInput';
import { ProfileButton } from '../components/ProfileButton';
import { PROFILE_CONFIG } from '../styles/profiles';
import { mockWearables } from '../api/mock/data';
import { apiUrl } from '../api/client';
import { getMyWearableUuid } from '../api/wearables';

export default function Reader() {
  const [code, setCode] = useState('');
  const [searchingMine, setSearchingMine] = useState(false);
  const [noWearable, setNoWearable] = useState(false);
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  // O titular não precisa digitar código: o servidor sabe quais pulseiras
  // são dele, então o site abre os dados direto pela primeira ativa.
  const ownerFlow = Boolean(session && session.role === 'usuario' && apiUrl() && session.token);

  useEffect(() => {
    if (!ownerFlow || !session?.patientId) return;
    let active = true;
    setSearchingMine(true);
    getMyWearableUuid(session.patientId, session.token)
      .then((uuid) => {
        if (!active) return;
        if (uuid) navigate(`/pulseira/${uuid}`, { replace: true });
        else setNoWearable(true);
      })
      .catch(() => {
        if (active) setNoWearable(true);
      })
      .finally(() => {
        if (active) setSearchingMine(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerFlow, session?.patientId]);

  if (!session) return null; // RequireAuth garante sessão; guarda de tipo

  if (ownerFlow) {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10">
            <Nfc aria-hidden className="size-7 text-brand" />
          </span>
          <h1 className="mt-4 text-xl font-bold">Meus dados de emergência</h1>
          {searchingMine && (
            <p className="mt-2 text-sm text-slate-500">Localizando sua pulseira…</p>
          )}
          {noWearable && (
            <p className="mt-2 text-sm text-slate-500">
              Você ainda não tem uma pulseira vinculada. Vincule uma pelo aplicativo
              HelpTap no celular para ver seus dados aqui.
            </p>
          )}
          <button
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="mt-6 text-sm text-slate-500 underline hover:text-slate-700"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.trim()) navigate(`/pulseira/${code.trim()}`);
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10">
          <Nfc aria-hidden className="size-7 text-brand" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Leitura de Pulseira</h1>
        <p className="mt-1 text-sm text-slate-500">
          Conectado como <strong>{session.name}</strong> ({PROFILE_CONFIG[session.role].title}).
          Aproxime o celular da pulseira NFC ou digite o código abaixo.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <IconInput
            label="Código da pulseira"
            Icon={Nfc}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="UUID da pulseira"
          />
          <ProfileButton profile={session.role} type="submit">
            Abrir paciente
          </ProfileButton>
        </form>
        {/* Bloco de demonstração acadêmica: só aparece no modo mock (sem API). */}
        {!apiUrl() && (
        <div className="mt-8 rounded-xl bg-white p-4 text-left shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pulseiras de demonstração
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {mockWearables.map((w) => (
              <li key={w.uuid}>
                <Link to={`/pulseira/${w.uuid}`} className="text-brand underline">
                  {w.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        )}
        {apiUrl() && (
          <Link to="/conta" className="mt-6 block text-sm text-brand underline">
            Minha conta
          </Link>
        )}
        <button
          onClick={() => {
            signOut();
            navigate('/');
          }}
          className="mt-3 text-sm text-slate-500 underline hover:text-slate-700"
        >
          Sair
        </button>
      </div>
    </main>
  );
}
