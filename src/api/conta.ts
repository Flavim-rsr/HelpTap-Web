import { request } from './client';

export type MinhaConta = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  identifier: string | null;
  role: string;
};

export function minhaConta(userId: number, token: string): Promise<MinhaConta> {
  return request<MinhaConta>(`/api/users/${userId}`, { method: 'GET', token });
}

/** O PUT do back é parcial: envia só o campo alterado. */
export function atualizarConta(
  userId: number,
  dados: { email?: string; password?: string },
  token: string,
): Promise<MinhaConta> {
  return request<MinhaConta>(`/api/users/${userId}`, { method: 'PUT', body: dados, token });
}

export function excluirConta(userId: number, token: string): Promise<void> {
  return request<void>(`/api/users/${userId}`, { method: 'DELETE', token });
}
