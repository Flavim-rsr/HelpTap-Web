import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { login, signUp } from './auth';

const LOGIN_RESPONSE = {
  token: 'jwt-token',
  type: 'Bearer',
  userId: 7,
  email: 'medico@x.com',
  fullName: 'Dra. Ana',
  role: 'DOCTOR',
};

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.teste');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('login real', () => {
  test('monta a sessão a partir da resposta do back', async () => {
    const fetchMock = mockFetch(200, LOGIN_RESPONSE);
    vi.stubGlobal('fetch', fetchMock);

    const session = await login('medico', { email: 'Medico@X.com ', password: '123456' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.teste/api/auth/web/login',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ email: 'medico@x.com', password: '123456' });
    expect(session).toEqual({ token: 'jwt-token', userId: 7, role: 'medico', name: 'Dra. Ana' });
  });

  test('titular recebe patientId com o próprio userId', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { ...LOGIN_RESPONSE, role: 'PATIENT' }));

    const session = await login('usuario', { email: 'a@b.com', password: 'x' });

    expect(session.patientId).toBe('7');
  });

  test('conta de outro perfil é recusada com orientação', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { ...LOGIN_RESPONSE, role: 'POLICE' }));

    await expect(login('medico', { email: 'a@b.com', password: 'x' })).rejects.toThrow(
      /outro perfil/,
    );
  });

  test('erro do back é traduzido para o usuário', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(401, { status: 401, message: 'Invalid email or password' }),
    );

    await expect(login('medico', { email: 'a@b.com', password: 'x' })).rejects.toThrow(
      'E-mail ou senha inválidos.',
    );
  });
});

describe('cadastro real', () => {
  test('envia o payload do back com papel, credencial e CPF só com dígitos', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 201, text: () => Promise.resolve('{}') })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(LOGIN_RESPONSE)),
      });
    vi.stubGlobal('fetch', fetchMock);

    const session = await signUp('medico', {
      name: 'Dra. Ana',
      cpf: '529.982.247-25',
      phone: '(16) 99999-0000',
      registration: 'crm123456-sp',
      email: 'medico@x.com',
      password: '123456',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      fullName: 'Dra. Ana',
      cpf: '52998224725',
      email: 'medico@x.com',
      password: '123456',
      identifier: 'CRM123456-SP',
      role: 'DOCTOR',
      phone: '16999990000',
    });
    expect(session.role).toBe('medico');
  });

  test('validação de credencial indisponível vira mensagem clara', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(409, { status: 409, message: 'Unable to validate a credential. Check...' }),
    );

    await expect(
      signUp('medico', {
        name: 'X',
        cpf: '52998224725',
        phone: '',
        registration: 'CRM1-SP',
        email: 'a@b.com',
        password: '123456',
      }),
    ).rejects.toThrow(/validar o registro profissional/);
  });
});
