import { useState, useEffect } from "react";
import { processosAPI, clientesAPI } from "../api";
import ProcessosTable from "../components/ProcessosTable";
import ProcessoForm from "../components/ProcessoForm";
import Alert from "../components/Alert";
import { Plus } from "lucide-react";
import ProcessosFetch from "../components/ProcessosFetch";

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [showForm, setShowForm] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    fetchProcessos();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!message) return;
    const timeoutId = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timeoutId);
  }, [message]);

  const fetchClientes = async () => {
    try {
      const response = await clientesAPI.getAllClientes();
      setClientes(response.data || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setMessage("Não foi possível carregar os clientes.");
      setMessageType("error");
    }
  };

  const fetchProcessos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await processosAPI.getAllProcessos();
      setProcessos(response.data || []);
    } catch (err) {
      console.error("Erro ao carregar processos:", err);
      setError(
        err.response?.data?.error || "Não foi possível carregar os processos.",
      );
    } finally {
      setLoading(false);
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

  const handleSaveProcesso = (messageText, type = "success") => {
    setMessage(messageText);
    setMessageType(type);

    if (type === "success") {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleMessage = (messageText, type = "success") => {
    setMessage(messageText);
    setMessageType(type);
  };

  return (
    <div className="processos-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Processos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Visualize a lista de processos diretamente da API e do banco de
            dados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewProcesso}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Plus className="mr-2" size={18} />
          Novo Processo
        </button>
      </div>

      {message && (
        <div className="mb-6">
          <Alert
            type={messageType}
            message={message}
            onClose={() => setMessage("")}
          />
        </div>
      )}

      <ProcessosTable
        processos={processos}
        loading={loading}
        error={error}
        onEdit={handleEditProcesso}
        onRefresh={fetchProcessos}
        onMessage={handleMessage}
      />

      {showForm && (
        <ProcessoForm
          processo={editingProcesso}
          clientes={clientes}
          onClose={handleCloseForm}
          onSave={handleSaveProcesso}
        />
      )}

      {/* Componente demonstrativo que usa fetch() puro para obter/processos da API */}
      <ProcessosFetch />
    </div>
  );
}
