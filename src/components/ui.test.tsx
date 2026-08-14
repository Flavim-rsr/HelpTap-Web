import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { IconInput } from './IconInput';
import { SeverityBadge } from './SeverityBadge';
import { ProfileCard } from './ProfileCard';

test('IconInput associa label ao input', () => {
  render(<IconInput label="E-mail" Icon={Mail} type="email" />);
  expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
});

test('SeverityBadge exibe o nível com acento', () => {
  render(<SeverityBadge level="Media" />);
  expect(screen.getByText('Média')).toBeInTheDocument();
});

test('ProfileCard aponta para a tela de login do perfil', () => {
  render(
    <MemoryRouter>
      <ProfileCard profile="medico" />
    </MemoryRouter>,
  );
  const link = screen.getByRole('link', { name: /médico/i });
  expect(link).toHaveAttribute('href', '/login/medico');
});
