import { Link, useNavigate } from 'react-router-dom';

export default function NotFound({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ textAlign: 'center', maxWidth: 520, padding: 32 }}>
        <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
        <h2 style={{ marginBottom: 12 }}>Página não encontrada</h2>
        <p style={{ color: '#cbd5e1', marginBottom: 24 }}>
          A página solicitada não existe ou foi removida.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')} 
            style={{ padding: '0.8rem 1.1rem', borderRadius: 10, background: '#38bdf8', color: '#082f49', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            {isAuthenticated ? 'Voltar ao dashboard' : 'Voltar ao início'}
          </button>
          {!isAuthenticated && (
            <Link to="/login" style={{ padding: '0.8rem 1.1rem', borderRadius: 10, background: '#1e293b', color: '#e2e8f0', textDecoration: 'none', fontWeight: 700 }}>
              Ir para login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
