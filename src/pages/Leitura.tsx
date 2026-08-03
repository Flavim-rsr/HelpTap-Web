import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Nfc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG } from '../styles/perfis';
import { wearablesMock } from '../api/mock/data';

export default function Leitura() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();
  const { sessao, sair } = useAuth();
  if (!sessao) return null; // RequireAuth garante sessão; guarda de tipo

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (codigo.trim()) navigate(`/pulseira/${codigo.trim()}`);
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10">
          <Nfc aria-hidden className="size-7 text-brand" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Leitura de Pulseira</h1>
        <p className="mt-1 text-sm text-slate-500">
          Conectado como <strong>{sessao.nome}</strong> ({PERFIL_CONFIG[sessao.role].titulo}).
          Aproxime o celular da pulseira NFC ou digite o código abaixo.
        </p>
        <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-4">
          <InputComIcone
            label="Código da pulseira"
            Icone={Nfc}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="UUID da pulseira"
          />
          <BotaoPerfil perfil={sessao.role} type="submit">
            Abrir paciente
          </BotaoPerfil>
        </form>
        {/* Bloco exclusivo de demonstração acadêmica — remover na integração real */}
        <div className="mt-8 rounded-xl bg-white p-4 text-left shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pulseiras de demonstração
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {wearablesMock.map((w) => (
              <li key={w.uuid}>
                <Link to={`/pulseira/${w.uuid}`} className="text-brand underline">
                  {w.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => {
            sair();
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
