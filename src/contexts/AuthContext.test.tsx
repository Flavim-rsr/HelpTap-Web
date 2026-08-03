import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { RequireAuth } from '../components/RequireAuth';
import type { Sessao } from '../types';

const sessaoFake: Sessao = { token: 't', role: 'medico', nome: 'Dra. Carla' };

beforeEach(() => sessionStorage.clear());

function Cenario({ inicial }: { inicial: string }) {
  return (
    <MemoryRouter initialEntries={[inicial]}>
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
  render(<Cenario inicial="/pulseira/abc-123" />);
  expect(screen.getByText('Seleção de perfil')).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBe('/pulseira/abc-123');
});

test('com sessão persistida, renderiza a rota protegida', () => {
  sessionStorage.setItem('helptap.sessao', JSON.stringify(sessaoFake));
  render(<Cenario inicial="/pulseira/abc-123" />);
  expect(screen.getByText('Tela do paciente')).toBeInTheDocument();
});

test('entrar persiste a sessão e sair limpa', () => {
  function Sonda() {
    const { sessao, entrar, sair } = useAuth();
    return (
      <div>
        <p>{sessao ? sessao.nome : 'anônimo'}</p>
        <button onClick={() => entrar(sessaoFake)}>entrar</button>
        <button onClick={() => sair()}>sair</button>
      </div>
    );
  }
  render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>,
  );
  fireEvent.click(screen.getByText('entrar'));
  expect(sessionStorage.getItem('helptap.sessao')).toContain('Dra. Carla');
  fireEvent.click(screen.getByText('sair'));
  expect(sessionStorage.getItem('helptap.sessao')).toBeNull();
});
