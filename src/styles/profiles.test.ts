import { PROFILES, SIGNUP_PROFILES, PROFILE_CONFIG, isProfile } from './profiles';

test('há 5 perfis e todos têm configuração completa', () => {
  expect(PROFILES).toEqual(['medico', 'policial', 'bombeiro', 'socorrista', 'usuario']);
  for (const p of PROFILES) {
    expect(PROFILE_CONFIG[p].title).toBeTruthy();
    expect(PROFILE_CONFIG[p].description).toBeTruthy();
    expect(PROFILE_CONFIG[p].gradient).toContain('from-');
  }
});

test('usuário não tem cadastro profissional', () => {
  expect(SIGNUP_PROFILES).toEqual(['medico', 'policial', 'bombeiro', 'socorrista']);
});

test('socorrista se cadastra com COREN e bombeiro tem card próprio', () => {
  expect(PROFILE_CONFIG.socorrista.registrationLabel).toBe('COREN');
  expect(PROFILE_CONFIG.socorrista.registrationPlaceholder).toBe('COREN123456-SP');
  expect(PROFILE_CONFIG.bombeiro.title).toBe('Bombeiro');
  expect(PROFILE_CONFIG.socorrista.title).toBe('Socorrista');
});

test('isProfile valida o parâmetro de rota', () => {
  expect(isProfile('medico')).toBe(true);
  expect(isProfile('xyz')).toBe(false);
});
