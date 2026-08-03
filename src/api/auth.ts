import type { CadastroProfissional, Credenciais, Role, Sessao } from '../types';
import { mockCadastro, mockLogin } from './mock/handlers';

export function login(perfil: Role, credenciais: Credenciais): Promise<Sessao> {
  return mockLogin(perfil, credenciais);
}

export function cadastrar(perfil: Role, dados: CadastroProfissional): Promise<Sessao> {
  return mockCadastro(perfil, dados);
}
