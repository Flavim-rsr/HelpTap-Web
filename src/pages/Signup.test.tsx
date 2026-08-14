import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

beforeEach(() => sessionStorage.clear());

function renderAt(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('usuário comum não tem cadastro na web', () => {
  renderAt('/cadastro/usuario');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});

test('cadastro de médico exibe campo CRM e rejeita registro inválido', async () => {
  renderAt('/cadastro/medico');
  expect(screen.getByRole('heading', { name: 'Cadastro de Médico' })).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Nome Completo'), 'Dr. Teste');
  await userEvent.type(screen.getByLabelText('CPF'), '529.982.247-25');
  await userEvent.type(screen.getByLabelText('Telefone'), '(16) 91111-1111');
  await userEvent.type(screen.getByLabelText('CRM'), 'abc');
  await userEvent.type(screen.getByLabelText('E-mail'), 'teste@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
  await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Registro profissional inválido');
});

test('cadastro válido cria a conta e navega para /leitura', async () => {
  renderAt('/cadastro/bombeiro');
  await userEvent.type(screen.getByLabelText('Nome Completo'), 'Cb. Nova');
  await userEvent.type(screen.getByLabelText('CPF'), '529.982.247-25');
  await userEvent.type(screen.getByLabelText('Telefone'), '(16) 92222-2222');
  await userEvent.type(screen.getByLabelText('Registro funcional'), 'CBM12345-SP');
  await userEvent.type(screen.getByLabelText('E-mail'), 'nova@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
  await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
  expect(await screen.findByText(/leitura de pulseira/i)).toBeInTheDocument();
});
