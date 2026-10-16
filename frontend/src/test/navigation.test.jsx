import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';

const LocationState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <output data-testid="current-path">{location.pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>Voltar</button>
    </>
  );
};

const renderNavigation = (initialPath = '/dashboard', perfil = 'admin') => render(
  <MemoryRouter initialEntries={[initialPath]}>
    <Sidebar user={{ perfil }} />
    <Routes>
      <Route path="*" element={<LocationState />} />
    </Routes>
  </MemoryRouter>,
);

describe('sidebar route navigation', () => {
  it.each([
    ['Dashboard', '/dashboard'],
    ['Processos', '/processos'],
    ['Clientes', '/clientes'],
    ['Usuários', '/usuarios'],
    ['Configurações', '/configuracoes'],
  ])('navigates to %s and marks its route active', (label, path) => {
    renderNavigation();

    const link = screen.getByRole('link', { name: label });
    fireEvent.click(link);

    expect(screen.getByTestId('current-path')).toHaveTextContent(path);
    expect(link).toHaveClass('active');
  });

  it('keeps the active item in sync for direct routes and browser back navigation', () => {
    renderNavigation('/clientes');

    expect(screen.getByTestId('current-path')).toHaveTextContent('/clientes');
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveClass('active');

    fireEvent.click(screen.getByRole('link', { name: 'Processos' }));
    expect(screen.getByTestId('current-path')).toHaveTextContent('/processos');
    expect(screen.getByRole('link', { name: 'Processos' })).toHaveClass('active');

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByTestId('current-path')).toHaveTextContent('/clientes');
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveClass('active');
  });

  it('shows Usuários only to admins and never links non-admin users into the restricted route', () => {
    renderNavigation('/dashboard', 'advogado');

    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('preserves protected routing for unauthenticated users and non-admin profiles', () => {
    const unauthenticatedView = render(
      <MemoryRouter initialEntries={['/usuarios']}>
        <Routes>
          <Route path="/login" element={<p>Login protegido</p>} />
          <Route path="/usuarios" element={(
            <ProtectedRoute isAuthenticated={false} user={null} isInitializing={false} requiredProfile="admin">
              <p>Gerenciamento de usuários</p>
            </ProtectedRoute>
          )} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login protegido')).toBeInTheDocument();
    unauthenticatedView.unmount();

    render(
      <MemoryRouter initialEntries={['/usuarios']}>
        <Routes>
          <Route path="/usuarios" element={(
            <ProtectedRoute isAuthenticated user={{ perfil: 'advogado' }} isInitializing={false} requiredProfile="admin">
              <p>Gerenciamento de usuários</p>
            </ProtectedRoute>
          )} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.queryByText('Gerenciamento de usuários')).not.toBeInTheDocument();
  });
});