import { mockLogin, mockSignUp, validateRegistration } from './handlers';

test('login com credenciais válidas devolve sessão com role e nome', async () => {
  const s = await mockLogin('medico', { email: 'medico@helptap.com', password: '123456' });
  expect(s.role).toBe('medico');
  expect(s.name).toBe('Dra. Carla Mendes');
  expect(s.token).toBeTruthy();
});

test('login com senha errada rejeita', async () => {
  await expect(
    mockLogin('medico', { email: 'medico@helptap.com', password: 'errada' }),
  ).rejects.toThrow('E-mail ou senha inválidos');
});

test('login exige que o e-mail pertença ao perfil escolhido', async () => {
  await expect(
    mockLogin('policial', { email: 'medico@helptap.com', password: '123456' }),
  ).rejects.toThrow('E-mail ou senha inválidos');
});

test('login como titular devolve sessão com patientId', async () => {
  const s = await mockLogin('usuario', { email: 'rafael@helptap.com', password: '123456' });
  expect(s.patientId).toBe('p1');
});

test('validateRegistration espelha os formatos do back-end real', () => {
  expect(validateRegistration('medico', 'CRM123456-SP')).toBe(true);
  expect(validateRegistration('medico', '123456-SP')).toBe(true);
  expect(validateRegistration('medico', '12345')).toBe(false);
  expect(validateRegistration('policial', 'POL12345-SSP-SP')).toBe(true);
  expect(validateRegistration('policial', '12345678')).toBe(false);
  expect(validateRegistration('bombeiro', 'CBM98765-SP')).toBe(true);
  expect(validateRegistration('bombeiro', 'abc')).toBe(false);
  expect(validateRegistration('socorrista', 'COREN123456-SP')).toBe(true);
  expect(validateRegistration('socorrista', '123456-SP')).toBe(true);
  expect(validateRegistration('socorrista', 'CBM98765-SP')).toBe(false);
});

test('login como socorrista devolve sessão com role socorrista', async () => {
  const s = await mockLogin('socorrista', { email: 'socorrista@helptap.com', password: '123456' });
  expect(s.role).toBe('socorrista');
  expect(s.name).toBeTruthy();
});

test('cadastro com registro inválido rejeita; com registro válido cria conta e permite login', async () => {
  const data = {
    name: 'Dr. Novo',
    email: 'novo@helptap.com',
    phone: '(16) 90000-0000',
    password: 'senha123',
    registration: 'CRM54321-SP',
    cpf: '52998224725',
  };
  await expect(mockSignUp('medico', { ...data, registration: 'xx' })).rejects.toThrow(
    'Registro profissional inválido',
  );
  const s = await mockSignUp('medico', data);
  expect(s.role).toBe('medico');
  const login = await mockLogin('medico', { email: data.email, password: data.password });
  expect(login.name).toBe('Dr. Novo');
});

test('cadastro rejeita com e-mail já cadastrado', async () => {
  await expect(
    mockSignUp('medico', {
      name: 'Dr. Falso',
      email: 'medico@helptap.com',
      phone: '(16) 90000-0000',
      password: 'outrasenha',
      registration: 'CRM99999-SP',
      cpf: '52998224726',
    }),
  ).rejects.toThrow('E-mail já cadastrado');
});
