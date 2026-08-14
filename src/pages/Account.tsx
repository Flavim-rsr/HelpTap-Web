import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';
import { ApiError } from '../api/client';
import { deleteAccount, getMyAccount, updateAccount, type MyAccount } from '../api/account';
import { useAuth } from '../contexts/AuthContext';
import { IconInput } from '../components/IconInput';
import { ProfileButton } from '../components/ProfileButton';
import { PROFILE_CONFIG } from '../styles/profiles';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [account, setAccount] = useState<MyAccount | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [needsRelogin, setNeedsRelogin] = useState(false);

  useEffect(() => {
    if (!session?.userId) return;
    getMyAccount(session.userId, session.token)
      .then(setAccount)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar a conta'));
  }, [session]);

  if (!session) return null;
  if (!session.userId) {
    return (
      <main className="grid min-h-screen place-items-center p-4 text-center">
        <p className="text-sm text-slate-500">
          A conta só pode ser gerenciada com o servidor real conectado.
        </p>
      </main>
    );
  }

  const cfg = PROFILE_CONFIG[session.role];

  async function save(data: { email?: string; password?: string }, notice: string) {
    if (!session?.userId) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await updateAccount(session.userId, data, session.token);
      // E-mail e senha fazem parte da identidade do login: força nova entrada.
      setMessage(notice);
      setNeedsRelogin(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  function handleChangeEmail(e: FormEvent) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    save({ email }, 'E-mail alterado. Entre novamente com o novo e-mail.');
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage('');
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('');
      setError('As senhas não conferem.');
      return;
    }
    save({ password: newPassword }, 'Senha alterada. Entre novamente com a nova senha.');
  }

  async function handleDelete() {
    if (!session?.userId) return;
    setError('');
    try {
      await deleteAccount(session.userId, session.token);
      signOut();
      navigate('/');
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 403) {
        setError(
          'O servidor ainda não permite que profissionais excluam a própria conta. '
            + 'Solicite a exclusão ao administrador.',
        );
      } else {
        setError(e instanceof Error ? e.message : 'Não foi possível excluir a conta.');
      }
      setConfirmingDeletion(false);
    }
  }

  function endSession() {
    signOut();
    navigate(`/login/${session?.role ?? ''}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 p-4 pb-10">
      <Link to="/leitura" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar à leitura
      </Link>

      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white shadow-sm">
          <UserRound aria-hidden className={`size-8 ${cfg.textColor}`} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Minha conta</h1>
        <p className="mt-1 text-sm text-slate-500">{cfg.title}</p>
      </div>

      {account && (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dados do cadastro
          </h2>
          <dl className="mt-3 flex flex-col gap-2">
            <InfoRow label="Nome" value={account.fullName} />
            <InfoRow label="E-mail" value={account.email} />
            {account.phone && <InfoRow label="Telefone" value={account.phone} />}
            {account.identifier && <InfoRow label="Credencial" value={account.identifier} />}
          </dl>
        </section>
      )}

      {needsRelogin ? (
        <section className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-medium text-emerald-600">{message}</p>
          <button onClick={endSession} className="mt-3 text-sm text-brand underline">
            Ir para o login
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Alterar e-mail
            </h2>
            <form onSubmit={handleChangeEmail} className="mt-3 flex flex-col gap-3">
              <IconInput
                label="Novo e-mail"
                Icon={Mail}
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
              />
              <ProfileButton profile={session.role} type="submit" disabled={saving}>
                Salvar e-mail
              </ProfileButton>
            </form>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Alterar senha
            </h2>
            <form onSubmit={handleChangePassword} className="mt-3 flex flex-col gap-3">
              <IconInput
                label="Nova senha"
                Icon={Lock}
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <IconInput
                label="Confirmar nova senha"
                Icon={Lock}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
              />
              <ProfileButton profile={session.role} type="submit" disabled={saving}>
                Salvar senha
              </ProfileButton>
            </form>
          </section>

          <section className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Excluir conta
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              A exclusão remove seu cadastro e o acesso ao HelpTap. Não é possível desfazer.
            </p>
            {confirmingDeletion ? (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm font-medium text-red-600">
                  Tem certeza? Esta ação é permanente.
                </p>
                <button
                  onClick={handleDelete}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-md hover:bg-red-700"
                >
                  Confirmar exclusão
                </button>
                <button
                  onClick={() => setConfirmingDeletion(false)}
                  className="text-sm text-slate-500 underline"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDeletion(true)}
                className="mt-3 w-full rounded-xl border border-red-300 px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50"
              >
                Excluir minha conta
              </button>
            )}
          </section>
        </>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </main>
  );
}
