import { useState } from 'react';
import ClientesTable from '../components/ClientesTable';
import ClienteForm from '../components/ClienteForm';
import { Plus } from 'lucide-react';

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewCliente = () => {
    setEditingCliente(null);
    setShowForm(true);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCliente(null);
  };

  const handleSaveCliente = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn-primary" onClick={handleNewCliente}>
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <ClientesTable
        refreshTrigger={refreshTrigger}
        onEdit={handleEditCliente}
        onDelete={handleSaveCliente}
      />

      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onClose={handleCloseForm}
          onSave={handleSaveCliente}
        />
      )}
    </div>
  );
}
