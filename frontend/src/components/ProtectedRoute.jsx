import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ isAuthenticated, user, isInitializing, children, requiredProfile = null, redirectTo = '/login' }) {
  const location = useLocation();

  if (isInitializing) {
    return <div className="content-area"><p>Validando sessão...</p></div>;
  }

  if (!isAuthenticated) {
    const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectPath} replace state={{ from: location.pathname + location.search }} />;
  }

  if (requiredProfile && user?.perfil !== requiredProfile) {
    return (
      <div className="content-area">
        <div className="page-header">
          <h1>Acesso negado</h1>
        </div>
        <div style={{ background: '#111111', padding: '20px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
          <p style={{ color: '#f5f1e8' }}>Você não tem permissão para acessar esta área.</p>
          <p style={{ marginTop: '12px' }}>
            <a href="/dashboard" style={{ color: '#d4af37' }}>Voltar ao dashboard</a>
          </p>
        </div>
      </div>
    );
  }

  return children;
}
