import { useState, useEffect } from 'react';
import { processosAPI, clientesAPI } from '../api';
import { X } from 'lucide-react';

export default function ProcessoForm({ processo, clientes, onClose, onSave }) {
  const [formData, setFormData] = useState({
    titulo: '',
    area: '',
    prazo: '',
    status: 'ativo',
    descricao: '',
    prioridade: 'normal',
    clienteId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (processo) {
      setFormData({
        titulo: processo.titulo,
        area: processo.area,
        prazo: processo.prazo?.split('T')[0] || '',
        status: processo.status,
        descricao: processo.descricao || '',
        prioridade: processo.prioridade,
        clienteId: processo.clienteId
      });
    }
  }, [processo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (processo) {
        await processosAPI.updateProcesso(processo.id, formData);
      } else {
        await processosAPI.createProcesso(formData);
      }
      onSave?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar processo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{processo ? 'Editar Processo' : 'Novo Processo'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Área *</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Cliente *</label>
              <select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prazo *</label>
              <input
                type="date"
                name="prazo"
                value={formData.prazo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Prioridade</label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ativo">Ativo</option>
                <option value="aguardando">Aguardando</option>
                <option value="concluído">Concluído</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
