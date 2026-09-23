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
    return <div className="content-area usuarios-page"><p>Carregando usuários...</p></div>;
  }

  return (
    <div className="content-area usuarios-page">
      <div className="page-header">
        <h1>Usuários</h1>
      </div>

      <div className="usuarios-layout">
        <form onSubmit={handleSubmit} className="usuarios-card usuarios-form">
          <h2>{editingId ? 'Editar usuário' : 'Novo usuário'}</h2>

          <div className="usuarios-form-grid">
            <label>
              <span>Nome</span>
              <input name="nome" value={form.nome} onChange={handleChange} required />
            </label>

            <label>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              <span>Perfil</span>
              <select name="perfil" value={form.perfil} onChange={handleChange}>
                <option value="usuario">Usuário</option>
                <option value="advogado">Advogado</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              <span>{editingId ? 'Nova senha (opcional)' : 'Senha'}</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editingId}
                minLength={8}
              />
            </label>
          </div>

          {error && <div className="usuarios-message usuarios-message-error">{error}</div>}
          {successMessage && <div className="usuarios-message usuarios-message-success">{successMessage}</div>}

          <div className="usuarios-actions">
            <button type="submit" disabled={submitting} className="usuarios-save-button">
              {submitting ? 'Salvando...' : editingId ? 'Atualizar usuário' : 'Salvar usuário'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="usuarios-cancel-button">
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="usuarios-card usuarios-list-card">
          <h2>Lista de usuários</h2>
          <div className="usuarios-table-wrap">
            <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td className="usuarios-secondary-text">{usuario.email}</td>
                  <td className="usuarios-secondary-text usuarios-profile-cell">{usuario.perfil}</td>
                  <td className={usuario.ativo ? 'usuarios-status-active' : 'usuarios-secondary-text'}>{usuario.ativo ? 'Ativo' : 'Inativo'}</td>
                  <td className="usuarios-row-actions">
                    <button type="button" onClick={() => handleEdit(usuario)} className="usuarios-edit-button">
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(usuario)}
                      className={usuario.ativo ? 'usuarios-status-button usuarios-status-button-inactive' : 'usuarios-status-button usuarios-status-button-active'}
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
    </div>
  );
}
