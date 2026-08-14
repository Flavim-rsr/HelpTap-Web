import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CreditCard, BadgeCheck, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { signUp } from '../api/auth';
import { DESTINATION_KEY, useAuth } from '../contexts/AuthContext';
import { IconInput } from '../components/IconInput';
import { ProfileButton } from '../components/ProfileButton';
import { PROFILE_CONFIG, SIGNUP_PROFILES, isProfile } from '../styles/profiles';
import { formatCpf, formatPhone } from '../utils/format';
import NotFound from './NotFound';

export default function Signup() {
  // O nome do parâmetro segue a rota /cadastro/:perfil (URLs ficam em pt).
  const { perfil: profile = '' } = useParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', registration: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isProfile(profile) || !SIGNUP_PROFILES.includes(profile)) return <NotFound />;
  const cfg = PROFILE_CONFIG[profile];
  const Icon = cfg.Icon;

  // A máscara vive só na tela; o envio tira a pontuação (onlyDigits no signUp).
  const MASKS: Partial<Record<keyof typeof form, (value: string) => string>> = {
    cpf: formatCpf,
    phone: formatPhone,
  };

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const value = MASKS[name]?.(e.target.value) ?? e.target.value;
      setForm((f) => ({ ...f, [name]: value }));
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isProfile(profile)) return;
    setError('');
    setLoading(true);
    try {
      const session = await signUp(profile, form);
      signIn(session);
      const destination = sessionStorage.getItem(DESTINATION_KEY);
      sessionStorage.removeItem(DESTINATION_KEY);
      navigate(destination ?? '/leitura', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
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
          <h1 className="mt-4 text-2xl font-bold">Cadastro de {cfg.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha seus dados profissionais para validação
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <IconInput label="Nome Completo" Icon={UserRound} required placeholder="Seu nome completo" {...field('name')} />
          <IconInput label="CPF" Icon={CreditCard} required placeholder="000.000.000-00" {...field('cpf')} />
          <IconInput label="Telefone" Icon={Phone} required placeholder="(00) 00000-0000" {...field('phone')} />
          <IconInput
            // todos os perfis de SIGNUP_PROFILES definem registrationLabel (só 'usuario' não define)
            label={cfg.registrationLabel!}
            Icon={BadgeCheck}
            required
            placeholder={cfg.registrationPlaceholder}
            {...field('registration')}
          />
          <IconInput label="E-mail" Icon={Mail} type="email" required placeholder="seu@email.com" {...field('email')} />
          <IconInput label="Senha" Icon={Lock} type="password" required minLength={6} placeholder="Mínimo 6 caracteres" {...field('password')} />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <ProfileButton profile={profile} type="submit" disabled={loading}>
            {loading ? 'Criando…' : 'Criar Conta'}
          </ProfileButton>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to={`/login/${profile}`} className={`font-semibold ${cfg.textColor}`}>
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
