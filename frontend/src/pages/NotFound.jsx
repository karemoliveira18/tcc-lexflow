import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFound({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <main className="public-page">
      <div style={{ textAlign: 'center', maxWidth: 520, padding: 32 }}>
        <Logo size="md" />
        <h1 className="not-found-code">404</h1>
        <h2>Página não encontrada</h2>
        <p style={{ color: '#cbd5e1', marginBottom: 24 }}>
          A página solicitada não existe ou foi removida.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="public-action" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/') }>
            {isAuthenticated ? 'Voltar ao dashboard' : 'Voltar ao início'}
          </button>
          {!isAuthenticated && (
            <Link to="/login" className="public-action public-action-muted">
              Ir para login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
