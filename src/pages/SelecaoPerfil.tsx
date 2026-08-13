import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { PerfilCard } from '../components/PerfilCard';
import { PERFIS, PERFIS_CADASTRO, PERFIL_CONFIG } from '../styles/perfis';

export default function SelecaoPerfil() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md text-center">
        <img src={logo} alt="HelpTap" className="mx-auto size-20 drop-shadow-sm" />
        <h1 className="mt-4 text-3xl font-bold text-slate-800">
          Entrar no <span className="text-brand">Help</span>
          <span className="text-navy">Tap</span>
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Selecione seu perfil de acesso para visualizar informações de emergência
        </p>
        <div className="mt-8 flex flex-col gap-4">
          {PERFIS.map((p) => (
            <PerfilCard key={p} perfil={p} />
          ))}
        </div>
        <p className="mt-10 text-sm text-slate-500">Profissional ainda não cadastrado?</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          {PERFIS_CADASTRO.map((p) => (
            <Link
              key={p}
              to={`/cadastro/${p}`}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-white shadow hover:opacity-90 ${PERFIL_CONFIG[p].corSolida}`}
            >
              Cadastrar {PERFIL_CONFIG[p].tituloCurto ?? PERFIL_CONFIG[p].titulo}
            </Link>
          ))}
        </div>
        <p className="mt-8 text-[10px] text-slate-400">© 2026 HelpTap · Proteção em Emergências</p>
      </div>
    </main>
  );
}
