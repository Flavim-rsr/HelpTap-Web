import { request } from './client';

export type MyAccount = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  identifier: string | null;
  role: string;
};

export function getMyAccount(userId: number, token: string): Promise<MyAccount> {
  return request<MyAccount>(`/api/users/${userId}`, { method: 'GET', token });
}

/** O PUT do back é parcial: envia só o campo alterado. */
export function updateAccount(
  userId: number,
  data: { email?: string; password?: string },
  token: string,
): Promise<MyAccount> {
  return request<MyAccount>(`/api/users/${userId}`, { method: 'PUT', body: data, token });
}

export function deleteAccount(userId: number, token: string): Promise<void> {
  return request<void>(`/api/users/${userId}`, { method: 'DELETE', token });
}
