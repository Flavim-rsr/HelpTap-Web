import { mockLogin, mockCadastro, validarRegistro } from './handlers';

test('login com credenciais válidas devolve sessão com role e nome', async () => {
  const s = await mockLogin('medico', { email: 'medico@helptap.com', senha: '123456' });
  expect(s.role).toBe('medico');
  expect(s.nome).toBe('Dra. Carla Mendes');
  expect(s.token).toBeTruthy();
});

test('login com senha errada rejeita', async () => {
  await expect(
    mockLogin('medico', { email: 'medico@helptap.com', senha: 'errada' }),
  ).rejects.toThrow('E-mail ou senha inválidos');
});

test('login exige que o e-mail pertença ao perfil escolhido', async () => {
  await expect(
    mockLogin('policial', { email: 'medico@helptap.com', senha: '123456' }),
  ).rejects.toThrow('E-mail ou senha inválidos');
});

test('validarRegistro aceita CRM no formato CRM/UF 00000 e registros funcionais numéricos', () => {
  expect(validarRegistro('medico', 'CRM/SP 12345')).toBe(true);
  expect(validarRegistro('medico', '12345')).toBe(false);
  expect(validarRegistro('policial', '12345678')).toBe(true);
  expect(validarRegistro('bombeiro', 'abc')).toBe(false);
});

test('cadastro com registro inválido rejeita; com registro válido cria conta e permite login', async () => {
  const dados = {
    nome: 'Dr. Novo',
    email: 'novo@helptap.com',
    telefone: '(16) 90000-0000',
    senha: 'senha123',
    registro: 'CRM/SP 54321',
  };
  await expect(mockCadastro('medico', { ...dados, registro: 'xx' })).rejects.toThrow(
    'Registro profissional inválido',
  );
  const s = await mockCadastro('medico', dados);
  expect(s.role).toBe('medico');
  const login = await mockLogin('medico', { email: dados.email, senha: dados.senha });
  expect(login.nome).toBe('Dr. Novo');
});
