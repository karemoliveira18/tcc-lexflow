import { useState, useEffect } from 'react';
import { processosAPI, clientesAPI } from '../api';
import ProcessosTable from '../components/ProcessosTable';
import ProcessoForm from '../components/ProcessoForm';
import { Plus } from 'lucide-react';

export default function Processos() {
  const [showForm, setShowForm] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingClientes, setLoadingClientes] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await clientesAPI.getAllClientes();
      setClientes(response.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleNewProcesso = () => {
    setEditingProcesso(null);
    setShowForm(true);
  };

  const handleEditProcesso = (processo) => {
    setEditingProcesso(processo);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProcesso(null);
  };

  const handleSaveProcesso = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="processos-page">
      <div className="page-header">
        <h1>Processos</h1>
        <button className="btn-primary" onClick={handleNewProcesso}>
          <Plus size={20} />
          Novo Processo
        </button>
      </div>

      {loadingClientes ? (
        <div className="loading">Carregando...</div>
      ) : (
        <ProcessosTable
          refreshTrigger={refreshTrigger}
          onEdit={handleEditProcesso}
          onDelete={handleSaveProcesso}
        />
      )}

      {showForm && (
        <ProcessoForm
          processo={editingProcesso}
          clientes={clientes}
          onClose={handleCloseForm}
          onSave={handleSaveProcesso}
        />
      )}
    </div>
  );
}
