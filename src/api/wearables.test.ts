import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getMyWearableUuid, uuidFromLink } from './wearables';

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.teste');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('uuidFromLink extrai o último segmento do link da pulseira', () => {
  expect(uuidFromLink('https://x.app/pulseira/abc-123')).toBe('abc-123');
  expect(uuidFromLink('https://x.app/pulseira/abc-123/')).toBe('abc-123');
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

  expect(await getMyWearableUuid('7', 'jwt')).toBe('bbb');
});

test('sem pulseiras devolve null', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('[]') }),
  );

  expect(await getMyWearableUuid('7', 'jwt')).toBeNull();
});
