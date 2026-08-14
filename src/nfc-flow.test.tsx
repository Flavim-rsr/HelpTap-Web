import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';

beforeEach(() => sessionStorage.clear());

test('fluxo NFC completo: pulseira → seleção de perfil → login → paciente filtrado', async () => {
  // 1. O socorrista aproxima o celular da pulseira: abre a URL sem estar logado
  render(
    <MemoryRouter initialEntries={[`/pulseira/${UUID_RAFAEL}`]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );

  // 2. É levado à seleção de perfil (destino preservado)
  expect(screen.getByRole('heading', { name: /entrar no/i })).toBeInTheDocument();

  // 3. Escolhe o perfil Bombeiro / Socorrista (regex ancorado para não casar com "Cadastrar Bombeiro")
  await userEvent.click(screen.getByRole('link', { name: /^bombeiro/i }));
  expect(await screen.findByRole('heading', { name: /acesso bombeiro/i })).toBeInTheDocument();

  // 4. Faz login
  await userEvent.type(screen.getByLabelText('E-mail'), 'bombeiro@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  // 5. Cai DIRETO na tela do paciente (sem etapas intermediárias — requisito dos 30s)
  expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument();
  expect(screen.getByText('O+')).toBeInTheDocument();
  expect(screen.getByText('Dipirona')).toBeInTheDocument();
  // ...já filtrado: bombeiro não vê CPF nem doenças sensíveis
  expect(screen.queryByText('123.456.789-00')).not.toBeInTheDocument();
  expect(screen.queryByText('HIV positivo')).not.toBeInTheDocument();
});
