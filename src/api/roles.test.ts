import { BACKEND_ROLE, roleFromBackend } from './roles';

test('socorrista corresponde a RESCUER no back, separado de bombeiro (FIREFIGHTER)', () => {
  expect(BACKEND_ROLE.socorrista).toBe('RESCUER');
  expect(BACKEND_ROLE.bombeiro).toBe('FIREFIGHTER');
  expect(roleFromBackend('RESCUER')).toBe('socorrista');
  expect(roleFromBackend('FIREFIGHTER')).toBe('bombeiro');
});

test('papéis sem perfil no web são rejeitados', () => {
  expect(roleFromBackend('ADMIN')).toBeNull();
});
