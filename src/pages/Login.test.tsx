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

test('perfil inválido na URL mostra 404', () => {
  renderAt('/login/astronauta');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});

test('credenciais erradas mostram erro acessível', async () => {
  renderAt('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'errada');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');
});

test('login bem-sucedido navega para o destino guardado', async () => {
  sessionStorage.setItem('helptap.destino', '/pulseira/550e8400-e29b-41d4-a716-446655440001');
  renderAt('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBeNull();
});

test('usuário não tem link de cadastro', () => {
  renderAt('/login/usuario');
  expect(screen.queryByText(/cadastre-se/i)).not.toBeInTheDocument();
});
