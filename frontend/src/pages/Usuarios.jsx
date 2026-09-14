import { useEffect, useState } from 'react';
import { usersAPI } from '../api';

const emptyForm = {
  nome: '',
  email: '',
  password: '',
  perfil: 'usuario',
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState(emptyForm);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers();
      setUsuarios(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        perfil: form.perfil,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (editingId) {
        await usersAPI.updateUser(editingId, payload);
        setSuccessMessage('Usuário atualizado com sucesso.');
      } else {
        await usersAPI.createUser({
          ...payload,
          password: form.password,
        });
        setSuccessMessage('Usuário criado com sucesso.');
      }

      resetForm();
      await fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível salvar o usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingId(usuario.id);
    setError('');
    setSuccessMessage('');
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      password: '',
      perfil: usuario.perfil,
    });
  };

  const handleToggleStatus = async (usuario) => {
    const nextStatus = !usuario.ativo;
    setError('');
    setSuccessMessage('');

    try {
      await usersAPI.toggleUserStatus(usuario.id, { ativo: nextStatus });
      setSuccessMessage(nextStatus ? 'Usuário ativado com sucesso.' : 'Usuário inativado com sucesso.');
      await fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível alterar o status do usuário.');
    }
  };

  if (loading) {
    return <div className="content-area"><p>Carregando usuários...</p></div>;
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1>Usuários</h1>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'grid', gap: 12 }}>
          <h2 style={{ margin: 0 }}>{editingId ? 'Editar usuário' : 'Novo usuário'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Nome</span>
              <input name="nome" value={form.nome} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Perfil</span>
              <select name="perfil" value={form.perfil} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                <option value="usuario">Usuário</option>
                <option value="advogado">Advogado</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>{editingId ? 'Nova senha (opcional)' : 'Senha'}</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editingId}
                minLength={8}
                style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
            </label>
          </div>

          {error && <div style={{ color: '#b91c1c', background: '#fee2e2', borderRadius: 8, padding: '10px 12px' }}>{error}</div>}
          {successMessage && <div style={{ color: '#166534', background: '#dcfce7', borderRadius: 8, padding: '10px 12px' }}>{successMessage}</div>}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="submit" disabled={submitting} style={{ padding: '10px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {submitting ? 'Salvando...' : editingId ? 'Atualizar usuário' : 'Salvar usuário'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 16px', borderRadius: 8, background: '#e2e8f0', color: '#0f172a', border: 'none', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Lista de usuários</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Perfil</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td style={{ padding: '10px 8px' }}>{usuario.nome}</td>
                  <td style={{ padding: '10px 8px' }}>{usuario.email}</td>
                  <td style={{ padding: '10px 8px' }}>{usuario.perfil}</td>
                  <td style={{ padding: '10px 8px' }}>{usuario.ativo ? 'Ativo' : 'Inativo'}</td>
                  <td style={{ padding: '10px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => handleEdit(usuario)} style={{ padding: '8px 10px', borderRadius: 8, border: 'none', background: '#dbeafe', color: '#1d4ed8', cursor: 'pointer' }}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(usuario)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: 'none',
                        background: usuario.ativo ? '#fee2e2' : '#dcfce7',
                        color: usuario.ativo ? '#b91c1c' : '#166534',
                        cursor: 'pointer',
                      }}
                    >
                      {usuario.ativo ? 'Inativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
