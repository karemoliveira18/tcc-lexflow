import { useEffect, useState } from 'react';
import { usersAPI } from '../api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAllUsers();
        setUsuarios(response.data?.data || []);
      } catch (err) {
        setError('Não foi possível carregar usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (loading) return <div className="content-area"><p>Carregando usuários...</p></div>;
  if (error) return <div className="content-area"><p>{error}</p></div>;

  return (
    <div className="content-area">
      <div className="page-header">
        <h1>Usuários</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
        <p>Gestão administrativa de usuários.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Nome</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Perfil</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td style={{ padding: '10px 8px' }}>{usuario.nome}</td>
                <td style={{ padding: '10px 8px' }}>{usuario.email}</td>
                <td style={{ padding: '10px 8px' }}>{usuario.perfil}</td>
                <td style={{ padding: '10px 8px' }}>{usuario.ativo ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
