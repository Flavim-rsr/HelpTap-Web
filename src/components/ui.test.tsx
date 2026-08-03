import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { InputComIcone } from './InputComIcone';
import { BadgeCriticidade } from './BadgeCriticidade';
import { PerfilCard } from './PerfilCard';

test('InputComIcone associa label ao input', () => {
  render(<InputComIcone label="E-mail" Icone={Mail} type="email" />);
  expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
});

test('BadgeCriticidade exibe o nível com acento', () => {
  render(<BadgeCriticidade nivel="Media" />);
  expect(screen.getByText('Média')).toBeInTheDocument();
});

test('PerfilCard aponta para a tela de login do perfil', () => {
  render(
    <MemoryRouter>
      <PerfilCard perfil="medico" />
    </MemoryRouter>,
  );
  const link = screen.getByRole('link', { name: /médico/i });
  expect(link).toHaveAttribute('href', '/login/medico');
});
