import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import { accessLogs } from '../api/mock/handlers';
import type { Role, Session } from '../types';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';
const UUID_ANA = '550e8400-e29b-41d4-a716-446655440002';

beforeEach(() => sessionStorage.clear());

function renderAs(role: Role, route: string) {
  const session: Session = { token: 't', role, name: 'Teste' };
  sessionStorage.setItem('helptap.sessao', JSON.stringify(session));
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('médico vê ficha completa, alergias com criticidade e transtornos', async () => {
  renderAs('medico', `/pulseira/${UUID_ANA}`);
  expect(await screen.findByText('Ana Clara Souza')).toBeInTheDocument();
  expect(screen.getByText('A-')).toBeInTheDocument();
  expect(screen.getByText('Amendoim')).toBeInTheDocument();
  expect(screen.getByText('Alta')).toBeInTheDocument();
  expect(screen.getByText(/espectro autista/i)).toBeInTheDocument();
});

test('policial vê identificação civil e NENHUM dado clínico', async () => {
  renderAs('policial', `/pulseira/${UUID_RAFAEL}`);
  expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument();
  expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
  expect(screen.getByText('Ana Santos')).toBeInTheDocument();
  expect(screen.queryByText('Ficha Médica')).not.toBeInTheDocument();
  expect(screen.queryByText('O+')).not.toBeInTheDocument();
  expect(screen.queryByText('Dipirona')).not.toBeInTheDocument();
});

test('bombeiro vê ficha essencial sem CPF, filiação nem doenças sensíveis', async () => {
  renderAs('bombeiro', `/pulseira/${UUID_RAFAEL}`);
  expect(await screen.findByText('O+')).toBeInTheDocument();
  expect(screen.getByText('Dipirona')).toBeInTheDocument();
  expect(screen.queryByText('123.456.789-00')).not.toBeInTheDocument();
  expect(screen.queryByText('Ana Santos')).not.toBeInTheDocument();
  expect(screen.queryByText('HIV positivo')).not.toBeInTheDocument();
});

test('uuid desconhecido mostra tela de pulseira não vinculada', async () => {
  renderAs('medico', '/pulseira/nao-existe');
  expect(await screen.findByText(/pulseira não vinculada/i)).toBeInTheDocument();
});

test('a leitura registra um AccessLog', async () => {
  const before = accessLogs.length;
  renderAs('medico', `/pulseira/${UUID_RAFAEL}`);
  await screen.findByText('Rafael Andrade');
  expect(accessLogs.length).toBeGreaterThan(before);
});
