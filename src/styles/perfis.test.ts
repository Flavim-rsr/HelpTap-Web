import { PERFIS, PERFIS_CADASTRO, PERFIL_CONFIG, ehPerfil } from './perfis';

test('há 4 perfis e todos têm configuração completa', () => {
  expect(PERFIS).toEqual(['medico', 'policial', 'bombeiro', 'usuario']);
  for (const p of PERFIS) {
    expect(PERFIL_CONFIG[p].titulo).toBeTruthy();
    expect(PERFIL_CONFIG[p].descricao).toBeTruthy();
    expect(PERFIL_CONFIG[p].gradiente).toContain('from-');
  }
});

test('usuário não tem cadastro profissional', () => {
  expect(PERFIS_CADASTRO).toEqual(['medico', 'policial', 'bombeiro']);
});

test('ehPerfil valida o parâmetro de rota', () => {
  expect(ehPerfil('medico')).toBe(true);
  expect(ehPerfil('xyz')).toBe(false);
});
