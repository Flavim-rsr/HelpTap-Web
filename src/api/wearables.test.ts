import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { uuidDaMinhaPulseira, uuidDoLink } from './wearables';

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.teste');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('uuidDoLink extrai o último segmento do link da pulseira', () => {
  expect(uuidDoLink('https://x.app/pulseira/abc-123')).toBe('abc-123');
  expect(uuidDoLink('https://x.app/pulseira/abc-123/')).toBe('abc-123');
});

test('prefere a pulseira ativa do titular', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify([
            { id: 1, wearableName: 'Inativa', status: false, accessUrl: 'https://x/p/aaa' },
            { id: 2, wearableName: 'Ativa', status: true, accessUrl: 'https://x/p/bbb' },
          ]),
        ),
    }),
  );

  expect(await uuidDaMinhaPulseira('7', 'jwt')).toBe('bbb');
});

test('sem pulseiras devolve null', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('[]') }),
  );

  expect(await uuidDaMinhaPulseira('7', 'jwt')).toBeNull();
});
