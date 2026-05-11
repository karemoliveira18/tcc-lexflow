import { useState, useEffect } from 'react';
import { clientesAPI } from '../api';
import { Trash2, Edit2 } from 'lucide-react';

export default function ClientesTable({ refreshTrigger, onEdit, onDelete }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientes();
  }, [refreshTrigger]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesAPI.getAllClientes();
      setClientes(response.data);
    } catch (err) {
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await clientesAPI.deleteCliente(id);
        fetchClientes();
        onDelete?.();
      } catch (err) {
        alert('Erro ao deletar cliente');
      }
    }
  };

  if (loading) return <div className="loading">Carregando clientes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="clientes-table">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF/CNPJ</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td className="nome">{cliente.nome}</td>
              <td>{cliente.cpfCnpj}</td>
              <td>{cliente.email || 'N/A'}</td>
              <td>{cliente.telefone || 'N/A'}</td>
              <td>{cliente.cidade || 'N/A'}</td>
              <td className="actions">
                <button
                  className="btn-edit"
                  onClick={() => onEdit?.(cliente)}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(cliente.id)}
                  title="Deletar"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clientes.length === 0 && (
        <div className="empty-state">
          <p>Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
}
