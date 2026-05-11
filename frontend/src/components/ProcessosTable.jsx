import { useState, useEffect } from 'react';
import { processosAPI } from '../api';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function ProcessosTable({ refreshTrigger, onEdit, onDelete }) {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProcessos();
  }, [refreshTrigger]);

  const fetchProcessos = async () => {
    try {
      setLoading(true);
      const response = await processosAPI.getAllProcessos();
      setProcessos(response.data);
    } catch (err) {
      setError('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este processo?')) {
      try {
        await processosAPI.deleteProcesso(id);
        fetchProcessos();
        onDelete?.();
      } catch (err) {
        alert('Erro ao deletar processo');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ativo': 'status-ativo',
      'aguardando': 'status-aguardando',
      'concluído': 'status-concluido',
      'suspenso': 'status-suspenso'
    };
    return colors[status] || 'status-default';
  };

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      'alta': 'priority-high',
      'normal': 'priority-normal',
      'baixa': 'priority-low'
    };
    return colors[prioridade] || 'priority-default';
  };

  if (loading) return <div className="loading">Carregando processos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="processos-table">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Área</th>
            <th>Cliente</th>
            <th>Prazo</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {processos.map((processo) => (
            <tr key={processo.id}>
              <td className="titulo">{processo.titulo}</td>
              <td>{processo.area}</td>
              <td>{processo.cliente?.nome || 'N/A'}</td>
              <td>{new Date(processo.prazo).toLocaleDateString('pt-BR')}</td>
              <td>
                <span className={`badge ${getStatusColor(processo.status)}`}>
                  {processo.status}
                </span>
              </td>
              <td>
                <span className={`badge ${getPrioridadeColor(processo.prioridade)}`}>
                  {processo.prioridade}
                </span>
              </td>
              <td className="actions">
                <button
                  className="btn-edit"
                  onClick={() => onEdit?.(processo)}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(processo.id)}
                  title="Deletar"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {processos.length === 0 && (
        <div className="empty-state">
          <p>Nenhum processo encontrado</p>
        </div>
      )}
    </div>
  );
}
