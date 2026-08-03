import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

beforeEach(() => sessionStorage.clear());

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('perfil inválido na URL mostra 404', () => {
  renderEm('/login/astronauta');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});

test('credenciais erradas mostram erro acessível', async () => {
  renderEm('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'errada');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');
});

test('login bem-sucedido navega para o destino guardado', async () => {
  sessionStorage.setItem('helptap.destino', '/destino-teste');
  renderEm('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  // /destino-teste não existe -> 404 comprova que a navegação ocorreu
  expect(await screen.findByText(/página não encontrada/i)).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBeNull();
});

test('usuário não tem link de cadastro', () => {
  renderEm('/login/usuario');
  expect(screen.queryByText(/cadastre-se/i)).not.toBeInTheDocument();
});
