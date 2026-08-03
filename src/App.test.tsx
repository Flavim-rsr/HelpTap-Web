import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('a raiz mostra os 4 perfis e os botões de cadastro profissional', () => {
  renderEm('/');
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
  renderEm('/qualquer-coisa');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});
