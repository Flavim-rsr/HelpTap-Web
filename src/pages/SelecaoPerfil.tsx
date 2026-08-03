import { Link } from 'react-router-dom';
import { HandHeart } from 'lucide-react';
import { PerfilCard } from '../components/PerfilCard';
import { PERFIS, PERFIS_CADASTRO, PERFIL_CONFIG } from '../styles/perfis';

export default function SelecaoPerfil() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10">
          <HandHeart aria-hidden className="size-7 text-brand" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">
          Entrar no <span className="text-brand">HelpTap</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione seu perfil de acesso para visualizar informações de emergência
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {PERFIS.map((p) => (
            <PerfilCard key={p} perfil={p} />
          ))}
        </div>
        <p className="mt-8 text-xs text-slate-500">Profissional ainda não cadastrado?</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PERFIS_CADASTRO.map((p) => (
            <Link
              key={p}
              to={`/cadastro/${p}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 ${PERFIL_CONFIG[p].corSolida}`}
            >
              Cadastrar {PERFIL_CONFIG[p].titulo}
            </Link>
          ))}
        </div>
        <p className="mt-8 text-[10px] text-slate-400">© 2026 HelpTap · Proteção em Emergências</p>
      </div>
    </main>
  );
}
