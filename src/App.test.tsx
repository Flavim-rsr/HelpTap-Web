import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

function renderAt(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('a raiz mostra os 4 perfis e os botões de cadastro profissional', () => {
  renderAt('/');
  expect(screen.getByRole('heading', { name: /entrar no/i })).toBeInTheDocument();
  // regex ancorado em ^: o nome acessível do cartão começa com o título do perfil,
  // enquanto "Cadastrar Médico" não — evita match duplo
  expect(screen.getByRole('link', { name: /^médico/i })).toHaveAttribute('href', '/login/medico');
  expect(screen.getByRole('link', { name: /^policial/i })).toHaveAttribute('href', '/login/policial');
  expect(screen.getByRole('link', { name: /^bombeiro/i })).toHaveAttribute('href', '/login/bombeiro');
  expect(screen.getByRole('link', { name: /^próprio usuário/i })).toHaveAttribute('href', '/login/usuario');
  expect(screen.getByRole('link', { name: 'Cadastrar Médico' })).toHaveAttribute('href', '/cadastro/medico');
});

test('rota desconhecida cai no 404', () => {
  renderAt('/qualquer-coisa');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});
