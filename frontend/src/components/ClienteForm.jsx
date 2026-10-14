import { useState, useEffect } from 'react';
import { clientesAPI } from '../api';
import { X } from 'lucide-react';

export default function ClienteForm({ cliente, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (cliente) {
        await clientesAPI.updateCliente(cliente.id, formData);
      } else {
        await clientesAPI.createCliente(formData);
      }
      onSave?.(cliente ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
      onClose?.();
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(
        (typeof apiError === 'string' ? apiError : apiError?.message)
          || err.response?.data?.message
          || 'Erro ao salvar cliente',
      );
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
          <h2>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="cliente-nome">Nome *</label>
            <input
              id="cliente-nome"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cliente-cpfCnpj">CPF/CNPJ *</label>
              <input
                id="cliente-cpfCnpj"
                type="text"
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cliente-email">Email</label>
              <input
                id="cliente-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cliente-telefone">Telefone</label>
              <input
                id="cliente-telefone"
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cliente-cep">CEP</label>
              <input
                id="cliente-cep"
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cliente-endereco">Endereço</label>
            <input
              id="cliente-endereco"
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cliente-cidade">Cidade</label>
              <input
                id="cliente-cidade"
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cliente-estado">Estado</label>
              <input
                id="cliente-estado"
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cliente-observacoes">Observações</label>
            <textarea
              id="cliente-observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows="3"
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
