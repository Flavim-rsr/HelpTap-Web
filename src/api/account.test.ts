import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { deleteAccount, getMyAccount, updateAccount } from './account';

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => vi.stubEnv('VITE_API_URL', 'https://api.teste'));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('getMyAccount busca o usuário autenticado', async () => {
  const fetchMock = stubFetch(200, { id: 7, fullName: 'Dra. Ana' });
  await getMyAccount(7, 'jwt');
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.teste/api/users/7',
    expect.objectContaining({ method: 'GET' }),
  );
});

test('updateAccount envia só o campo alterado', async () => {
  const fetchMock = stubFetch(200, { id: 7 });
  await updateAccount(7, { password: 'NovaSenha1' }, 'jwt');
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ password: 'NovaSenha1' });
});

test('deleteAccount faz DELETE autenticado', async () => {
  const fetchMock = stubFetch(204, null);
  await deleteAccount(7, 'jwt');
  expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
});

test('erro de e-mail duplicado chega traduzido', async () => {
  stubFetch(409, { status: 409, message: 'Email already registered: x@y.com' });
  await expect(updateAccount(7, { email: 'x@y.com' }, 'jwt')).rejects.toThrow(
    'Este e-mail já está cadastrado.',
  );
});
