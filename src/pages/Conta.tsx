import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';
import { ErroApi } from '../api/client';
import { atualizarConta, excluirConta, minhaConta, type MinhaConta } from '../api/conta';
import { useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG } from '../styles/perfis';

function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="shrink-0 text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  );
}

export default function Conta() {
  const navigate = useNavigate();
  const { sessao, sair } = useAuth();
  const [conta, setConta] = useState<MinhaConta | null>(null);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [precisaRelogar, setPrecisaRelogar] = useState(false);

  useEffect(() => {
    if (!sessao?.userId) return;
    minhaConta(sessao.userId, sessao.token)
      .then(setConta)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar a conta'));
  }, [sessao]);

  if (!sessao) return null;
  if (!sessao.userId) {
    return (
      <main className="grid min-h-screen place-items-center p-4 text-center">
        <p className="text-sm text-slate-500">
          A conta só pode ser gerenciada com o servidor real conectado.
        </p>
      </main>
    );
  }

  const cfg = PERFIL_CONFIG[sessao.role];

  async function salvar(dados: { email?: string; password?: string }, aviso: string) {
    if (!sessao?.userId) return;
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await atualizarConta(sessao.userId, dados, sessao.token);
      // E-mail e senha fazem parte da identidade do login: força nova entrada.
      setMensagem(aviso);
      setPrecisaRelogar(true);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  function aoTrocarEmail(e: FormEvent) {
    e.preventDefault();
    const email = novoEmail.trim().toLowerCase();
    if (!email) return;
    salvar({ email }, 'E-mail alterado. Entre novamente com o novo e-mail.');
  }

  function aoTrocarSenha(e: FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 6) {
      setMensagem('');
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setMensagem('');
      setErro('As senhas não conferem.');
      return;
    }
    salvar({ password: novaSenha }, 'Senha alterada. Entre novamente com a nova senha.');
  }

  async function aoExcluir() {
    if (!sessao?.userId) return;
    setErro('');
    try {
      await excluirConta(sessao.userId, sessao.token);
      sair();
      navigate('/');
    } catch (e: unknown) {
      if (e instanceof ErroApi && e.status === 403) {
        setErro(
          'O servidor ainda não permite que profissionais excluam a própria conta. '
            + 'Solicite a exclusão ao administrador.',
        );
      } else {
        setErro(e instanceof Error ? e.message : 'Não foi possível excluir a conta.');
      }
      setConfirmandoExclusao(false);
    }
  }

  function encerrar() {
    sair();
    navigate(`/login/${sessao?.role ?? ''}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 p-4 pb-10">
      <Link to="/leitura" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar à leitura
      </Link>

      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white shadow-sm">
          <UserRound aria-hidden className={`size-8 ${cfg.corTexto}`} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Minha conta</h1>
        <p className="mt-1 text-sm text-slate-500">{cfg.titulo}</p>
      </div>

      {conta && (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dados do cadastro
          </h2>
          <dl className="mt-3 flex flex-col gap-2">
            <LinhaInfo rotulo="Nome" valor={conta.fullName} />
            <LinhaInfo rotulo="E-mail" valor={conta.email} />
            {conta.phone && <LinhaInfo rotulo="Telefone" valor={conta.phone} />}
            {conta.identifier && <LinhaInfo rotulo="Credencial" valor={conta.identifier} />}
          </dl>
        </section>
      )}

      {precisaRelogar ? (
        <section className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-medium text-emerald-600">{mensagem}</p>
          <button onClick={encerrar} className="mt-3 text-sm text-brand underline">
            Ir para o login
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Alterar e-mail
            </h2>
            <form onSubmit={aoTrocarEmail} className="mt-3 flex flex-col gap-3">
              <InputComIcone
                label="Novo e-mail"
                Icone={Mail}
                type="email"
                required
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="novo@email.com"
              />
              <BotaoPerfil perfil={sessao.role} type="submit" disabled={salvando}>
                Salvar e-mail
              </BotaoPerfil>
            </form>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Alterar senha
            </h2>
            <form onSubmit={aoTrocarSenha} className="mt-3 flex flex-col gap-3">
              <InputComIcone
                label="Nova senha"
                Icone={Lock}
                type="password"
                required
                minLength={6}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <InputComIcone
                label="Confirmar nova senha"
                Icone={Lock}
                type="password"
                required
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="Repita a nova senha"
              />
              <BotaoPerfil perfil={sessao.role} type="submit" disabled={salvando}>
                Salvar senha
              </BotaoPerfil>
            </form>
          </section>

          <section className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Excluir conta
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              A exclusão remove seu cadastro e o acesso ao HelpTap. Não é possível desfazer.
            </p>
            {confirmandoExclusao ? (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm font-medium text-red-600">
                  Tem certeza? Esta ação é permanente.
                </p>
                <button
                  onClick={aoExcluir}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-md hover:bg-red-700"
                >
                  Confirmar exclusão
                </button>
                <button
                  onClick={() => setConfirmandoExclusao(false)}
                  className="text-sm text-slate-500 underline"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="mt-3 w-full rounded-xl border border-red-300 px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50"
              >
                Excluir minha conta
              </button>
            )}
          </section>
        </>
      )}

      {erro && (
        <p role="alert" className="text-center text-sm text-red-600">
          {erro}
        </p>
      )}
    </main>
  );
}
