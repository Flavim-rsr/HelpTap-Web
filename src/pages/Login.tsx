import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { login } from '../api/auth';
import { DESTINATION_KEY, useAuth } from '../contexts/AuthContext';
import { IconInput } from '../components/IconInput';
import { ProfileButton } from '../components/ProfileButton';
import { PROFILE_CONFIG, isProfile } from '../styles/profiles';
import NotFound from './NotFound';

export default function Login() {
  // O nome do parâmetro segue a rota /login/:perfil (URLs ficam em pt).
  const { perfil: profile = '' } = useParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isProfile(profile)) return <NotFound />;
  const cfg = PROFILE_CONFIG[profile];
  const Icon = cfg.Icon;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isProfile(profile)) return;
    setError('');
    setLoading(true);
    try {
      const session = await login(profile, { email, password });
      signIn(session);
      const destination = sessionStorage.getItem(DESTINATION_KEY);
      sessionStorage.removeItem(DESTINATION_KEY);
      navigate(destination ?? '/leitura', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
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
            <Icon aria-hidden className={`size-8 ${cfg.textColor}`} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{cfg.accessTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile === 'usuario' ? 'Entre com suas credenciais' : 'Entre com suas credenciais profissionais'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <IconInput
            label="E-mail"
            Icon={Mail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <IconInput
            label="Senha"
            Icon={Lock}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <ProfileButton profile={profile} type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </ProfileButton>
        </form>
        {profile !== 'usuario' && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Não tem uma conta?{' '}
            <Link to={`/cadastro/${profile}`} className={`font-semibold ${cfg.textColor}`}>
              Cadastre-se
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
