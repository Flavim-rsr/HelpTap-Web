import type { CadastroProfissional, Credenciais, Role, Sessao } from '../types';
import { apiUrl, request } from './client';
import { BACKEND_ROLE, roleFromBackend } from './roles';
import { mockCadastro, mockLogin } from './mock/handlers';

type LoginResponse = {
  token: string;
  userId: number;
  fullName: string;
  role: string;
};

const soDigitos = (valor: string) => valor.replace(/\D/g, '');

function sessaoDe(perfil: Role, resposta: LoginResponse): Sessao {
  return {
    token: resposta.token,
    userId: resposta.userId,
    role: perfil,
    nome: resposta.fullName,
    ...(perfil === 'usuario' ? { pacienteId: String(resposta.userId) } : {}),
  };
}

export async function login(perfil: Role, credenciais: Credenciais): Promise<Sessao> {
  if (!apiUrl()) return mockLogin(perfil, credenciais);

  const resposta = await request<LoginResponse>('/api/auth/web/login', {
    body: { email: credenciais.email.trim().toLowerCase(), password: credenciais.senha },
  });

  if (roleFromBackend(resposta.role) !== perfil) {
    throw new Error('Esta conta pertence a outro perfil. Volte e selecione o perfil correto.');
  }
  return sessaoDe(perfil, resposta);
}

export async function cadastrar(perfil: Role, dados: CadastroProfissional): Promise<Sessao> {
  if (!apiUrl()) return mockCadastro(perfil, dados);

  const telefone = soDigitos(dados.telefone);
  await request('/api/users', {
    body: {
      fullName: dados.nome.trim(),
      cpf: soDigitos(dados.cpf),
      email: dados.email.trim().toLowerCase(),
      password: dados.senha,
      identifier: dados.registro.trim().toUpperCase(),
      role: BACKEND_ROLE[perfil],
      ...(telefone.length >= 10 ? { phone: telefone } : {}),
    },
  });

  // Conta criada; entra em seguida com as mesmas credenciais.
  return login(perfil, { email: dados.email, senha: dados.senha });
}
