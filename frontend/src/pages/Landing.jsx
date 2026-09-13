import { Link, Navigate } from 'react-router-dom';

export default function Landing({ isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ maxWidth: 720, textAlign: 'center', padding: 32 }}>
        <p style={{ letterSpacing: 2, textTransform: 'uppercase', color: '#7dd3fc', marginBottom: 12 }}>LexFlow</p>
        <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>Gestão jurídica moderna</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#cbd5e1', marginBottom: 32 }}>
          Acompanhe clientes, processos e prazos em um ambiente seguro, com autenticação por JWT e área interna protegida.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '0.85rem 1.5rem',
            borderRadius: 999,
            background: '#38bdf8',
            color: '#082f49',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Acessar login
        </Link>
      </div>
    </main>
  );
}
