import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { login } from '../api/auth';
import { CHAVE_DESTINO, useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG, ehPerfil } from '../styles/perfis';
import NotFound from './NotFound';

export default function Login() {
  const { perfil = '' } = useParams();
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!ehPerfil(perfil)) return <NotFound />;
  const cfg = PERFIL_CONFIG[perfil];
  const Icone = cfg.Icone;

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!ehPerfil(perfil)) return;
    setErro('');
    setCarregando(true);
    try {
      const sessao = await login(perfil, { email, senha });
      entrar(sessao);
      const destino = sessionStorage.getItem(CHAVE_DESTINO);
      sessionStorage.removeItem(CHAVE_DESTINO);
      navigate(destino ?? '/leitura', { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Início
        </Link>
        <div className="mt-6 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white shadow-sm">
            <Icone aria-hidden className={`size-8 ${cfg.corTexto}`} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{cfg.acessoTitulo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {perfil === 'usuario' ? 'Entre com suas credenciais' : 'Entre com suas credenciais profissionais'}
          </p>
        </div>
        <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-4">
          <InputComIcone
            label="E-mail"
            Icone={Mail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <InputComIcone
            label="Senha"
            Icone={Lock}
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••"
          />
          {erro && (
            <p role="alert" className="text-sm text-red-600">
              {erro}
            </p>
          )}
          <BotaoPerfil perfil={perfil} type="submit" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </BotaoPerfil>
        </form>
        {perfil !== 'usuario' && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Não tem uma conta?{' '}
            <Link to={`/cadastro/${perfil}`} className={`font-semibold ${cfg.corTexto}`}>
              Cadastre-se
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
