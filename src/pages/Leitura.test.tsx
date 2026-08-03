import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import type { Sessao } from '../types';

const sessaoMedico: Sessao = { token: 't', role: 'medico', nome: 'Dra. Carla Mendes' };

beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem('helptap.sessao', JSON.stringify(sessaoMedico));
});

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('mostra quem está conectado e as pulseiras de demonstração', () => {
  renderEm('/leitura');
  expect(screen.getByText(/dra\. carla mendes/i)).toBeInTheDocument();
  expect(screen.getByText('Pulseira de Rafael Andrade')).toBeInTheDocument();
});

test('submeter um código navega para /pulseira/:uuid', async () => {
  renderEm('/leitura');
  await userEvent.type(screen.getByLabelText('Código da pulseira'), 'abc-inexistente');
  await userEvent.click(screen.getByRole('button', { name: 'Abrir paciente' }));
  // rota /pulseira ainda não existe (Task 12) -> 404 comprova a navegação;
  // a Task 12 troca por: await screen.findByText(/pulseira não vinculada/i)
  expect(await screen.findByText(/página não encontrada/i)).toBeInTheDocument();
});

test('sem sessão, /leitura redireciona para a seleção de perfil', () => {
  sessionStorage.clear();
  renderEm('/leitura');
  expect(screen.getByRole('heading', { name: /entrar no/i })).toBeInTheDocument();
});
