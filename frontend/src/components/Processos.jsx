import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, PauseCircle, XCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';
import Button from './Button';
import FormInput from './FormInput';

const Processos = ({ showForm: externalShowForm = false, onShowFormChange }) => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    area: '',
    prazo: '',
    status: 'ativo'
  });

  useEffect(() => {
    setShowForm(externalShowForm);
  }, [externalShowForm]);

  useEffect(() => {
    fetchProcessos();
  }, []);

  const fetchProcessos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/processos');
      setProcessos(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar processos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFormVisibility = (nextValue) => {
    const next = typeof nextValue === 'boolean' ? nextValue : !showForm;
    setShowForm(next);
    if (onShowFormChange) {
      onShowFormChange(next);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProcesso) {
        await api.put(`/processos/${editingProcesso.id}`, formData);
      } else {
        await api.post('/processos', formData);
      }
      await fetchProcessos();
      resetForm();
    } catch (err) {
      setError('Erro ao salvar processo');
      console.error(err);
    }
  };

  const handleEdit = (processo) => {
    setEditingProcesso(processo);
    setFormData({
      titulo: processo.titulo,
      area: processo.area,
      prazo: processo.prazo.split('T')[0],
      status: processo.status
    });
    updateFormVisibility(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este processo?')) {
      return;
    }

    try {
      await api.delete(`/processos/${id}`);
      await fetchProcessos();
    } catch (err) {
      setError('Erro ao excluir processo');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      area: '',
      prazo: '',
      status: 'ativo'
    });
    setEditingProcesso(null);
    updateFormVisibility(false);
  };

  const getMetrics = () => {
    const total = processos.length;
    const ativo = processos.filter((p) => p.status === 'ativo').length;
    const pausado = processos.filter((p) => p.status === 'pausado').length;
    const inativo = processos.filter((p) => p.status === 'inativo').length;
    return { total, ativo, pausado, inativo };
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p className="mt-4 text-slate-400">Carregando processos...</p>
      </div>
    );
  }

  return (
    <div className="content-area">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card">
          <div className="p-3 bg-slate-800 rounded-xl mb-4">
            <CheckCircle2 size={24} className="text-blue-400" />
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-label">Total de Processos</div>
          <div className="metric-description">Processos monitorados</div>
        </div>

        <div className="metric-card">
          <div className="p-3 bg-green-500/20 rounded-xl mb-4">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
          <div className="metric-value">{metrics.ativo}</div>
          <div className="metric-label">Processos Ativos</div>
          <div className="metric-description">Em andamento</div>
        </div>

        <div className="metric-card">
          <div className="p-3 bg-yellow-500/20 rounded-xl mb-4">
            <PauseCircle size={24} className="text-yellow-400" />
          </div>
          <div className="metric-value">{metrics.pausado}</div>
          <div className="metric-label">Em Pausa</div>
          <div className="metric-description">Aguardando ação</div>
        </div>

        <div className="metric-card">
          <div className="p-3 bg-slate-800 rounded-xl mb-4">
            <XCircle size={24} className="text-slate-400" />
          </div>
          <div className="metric-value">{metrics.inativo}</div>
          <div className="metric-label">Concluídos</div>
          <div className="metric-description">Processos finalizados</div>
        </div>
      </div>

      {/* Botão Novo Processo */}
      <div className="flex justify-end mb-6">
        <Button variant="primary" onClick={() => updateFormVisibility(true)}>
          <Plus size={18} />
          Novo Processo
        </Button>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">
                  {editingProcesso ? 'Editar Processo' : 'Novo Processo'}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {editingProcesso ? 'Atualize as informações do processo' : 'Adicione um novo processo ao sistema'}
                </p>
              </div>
              <Button variant="ghost" onClick={() => updateFormVisibility(false)}>
                Fechar
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Título do Processo"
                  placeholder="Ex: Ação civil contra empresa X"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />

                <FormInput
                  label="Área Jurídica"
                  type="select"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  options={[
                    { value: '', label: 'Selecione uma área' },
                    { value: 'Direito Civil', label: 'Direito Civil' },
                    { value: 'Direito Penal', label: 'Direito Penal' },
                    { value: 'Direito Trabalhista', label: 'Direito Trabalhista' },
                    { value: 'Direito Tributário', label: 'Direito Tributário' },
                    { value: 'Direito Empresarial', label: 'Direito Empresarial' },
                    { value: 'Direito Previdenciário', label: 'Direito Previdenciário' },
                    { value: 'Direito Administrativo', label: 'Direito Administrativo' },
                    { value: 'Outro', label: 'Outro' }
                  ]}
                  required
                />

                <FormInput
                  label="Prazo"
                  type="date"
                  value={formData.prazo}
                  onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                  required
                />

                <FormInput
                  label="Status"
                  type="select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'pausado', label: 'Pausado' },
                    { value: 'inativo', label: 'Inativo' }
                  ]}
                />
              </div>

              <div className="form-actions">
                <Button variant="secondary" onClick={resetForm} type="button">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editingProcesso ? 'Atualizar Processo' : 'Salvar Processo'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabela de Processos */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">Processos Cadastrados</h3>
            <p className="text-slate-400 text-sm mt-1">
              Gerencie todos os seus processos jurídicos
            </p>
          </div>
        </div>

        {processos.length === 0 ? (
          <div className="empty-state">
            <XCircle size={48} className="empty-state-icon" />
            <div className="empty-state-title">Nenhum processo cadastrado</div>
            <div className="empty-state-description">
              Adicione seu primeiro processo para começar a organizar sua rotina jurídica.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Área</th>
                  <th>Prazo</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {processos.map((processo) => (
                  <motion.tr
                    key={processo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="font-medium">{processo.titulo}</td>
                    <td>{processo.area}</td>
                    <td>{new Date(processo.prazo).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`status-badge ${
                        processo.status === 'ativo' ? 'status-ativo' :
                        processo.status === 'pausado' ? 'status-pausado' : 'status-inativo'
                      }`}>
                        {processo.status === 'ativo' && <CheckCircle2 size={12} />}
                        {processo.status === 'pausado' && <PauseCircle size={12} />}
                        {processo.status === 'inativo' && <XCircle size={12} />}
                        {processo.status.charAt(0).toUpperCase() + processo.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(processo)}>
                          <Pencil size={14} />
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(processo.id)}>
                          <Trash2 size={14} />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Processos;
