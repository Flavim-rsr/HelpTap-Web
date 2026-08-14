import { PROFILES, SIGNUP_PROFILES, PROFILE_CONFIG, isProfile } from './profiles';

test('há 4 perfis e todos têm configuração completa', () => {
  expect(PROFILES).toEqual(['medico', 'policial', 'bombeiro', 'usuario']);
  for (const p of PROFILES) {
    expect(PROFILE_CONFIG[p].title).toBeTruthy();
    expect(PROFILE_CONFIG[p].description).toBeTruthy();
    expect(PROFILE_CONFIG[p].gradient).toContain('from-');
  }
});

test('usuário não tem cadastro profissional', () => {
  expect(SIGNUP_PROFILES).toEqual(['medico', 'policial', 'bombeiro']);
});

test('isProfile valida o parâmetro de rota', () => {
  expect(isProfile('medico')).toBe(true);
  expect(isProfile('xyz')).toBe(false);
});
