import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { RequireAuth } from '../components/RequireAuth';
import type { Session } from '../types';

const fakeSession: Session = { token: 't', role: 'medico', name: 'Dra. Carla' };

beforeEach(() => sessionStorage.clear());

function Scenario({ initial }: { initial: string }) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>Seleção de perfil</p>} />
          <Route
            path="/pulseira/:uuid"
            element={
              <RequireAuth>
                <p>Tela do paciente</p>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

test('sem sessão, redireciona para / e guarda o destino', () => {
  render(<Scenario initial="/pulseira/abc-123" />);
  expect(screen.getByText('Seleção de perfil')).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBe('/pulseira/abc-123');
});

test('com sessão persistida, renderiza a rota protegida', () => {
  sessionStorage.setItem('helptap.sessao', JSON.stringify(fakeSession));
  render(<Scenario initial="/pulseira/abc-123" />);
  expect(screen.getByText('Tela do paciente')).toBeInTheDocument();
});

test('entrar persiste a sessão e sair limpa', () => {
  function Probe() {
    const { session, signIn, signOut } = useAuth();
    return (
      <div>
        <p>{session ? session.name : 'anônimo'}</p>
        <button onClick={() => signIn(fakeSession)}>entrar</button>
        <button onClick={() => signOut()}>sair</button>
      </div>
    );
  }
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  fireEvent.click(screen.getByText('entrar'));
  expect(sessionStorage.getItem('helptap.sessao')).toContain('Dra. Carla');
  fireEvent.click(screen.getByText('sair'));
  expect(sessionStorage.getItem('helptap.sessao')).toBeNull();
});
