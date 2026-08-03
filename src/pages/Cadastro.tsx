import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { cadastrar } from '../api/auth';
import { CHAVE_DESTINO, useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG, PERFIS_CADASTRO, ehPerfil } from '../styles/perfis';
import NotFound from './NotFound';

export default function Cadastro() {
  const { perfil = '' } = useParams();
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [form, setForm] = useState({ nome: '', telefone: '', registro: '', email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!ehPerfil(perfil) || !PERFIS_CADASTRO.includes(perfil)) return <NotFound />;
  const cfg = PERFIL_CONFIG[perfil];
  const Icone = cfg.Icone;

  const campo = (nome: keyof typeof form) => ({
    value: form[nome],
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [nome]: e.target.value })),
  });

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!ehPerfil(perfil)) return;
    setErro('');
    setCarregando(true);
    try {
      const sessao = await cadastrar(perfil, form);
      entrar(sessao);
      const destino = sessionStorage.getItem(CHAVE_DESTINO);
      sessionStorage.removeItem(CHAVE_DESTINO);
      navigate(destino ?? '/leitura', { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Início
        </Link>
        <div className="mt-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white shadow-sm">
            <Icone aria-hidden className={`size-6 ${cfg.corTexto}`} />
          </span>
          <h1 className="mt-3 text-xl font-bold">Cadastro de {cfg.titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha seus dados profissionais para validação
          </p>
        </div>
        <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-4">
          <InputComIcone label="Nome Completo" Icone={UserRound} required placeholder="Seu nome completo" {...campo('nome')} />
          <InputComIcone label="Telefone" Icone={Phone} required placeholder="(00) 00000-0000" {...campo('telefone')} />
          <InputComIcone
            // todos os perfis de PERFIS_CADASTRO definem registroLabel (só 'usuario' não define)
            label={cfg.registroLabel!}
            Icone={BadgeCheck}
            required
            placeholder={cfg.registroPlaceholder}
            {...campo('registro')}
          />
          <InputComIcone label="E-mail" Icone={Mail} type="email" required placeholder="seu@email.com" {...campo('email')} />
          <InputComIcone label="Senha" Icone={Lock} type="password" required minLength={6} placeholder="Mínimo 6 caracteres" {...campo('senha')} />
          {erro && (
            <p role="alert" className="text-sm text-red-600">
              {erro}
            </p>
          )}
          <BotaoPerfil perfil={perfil} type="submit" disabled={carregando}>
            {carregando ? 'Criando…' : 'Criar Conta'}
          </BotaoPerfil>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to={`/login/${perfil}`} className={`font-semibold ${cfg.corTexto}`}>
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
