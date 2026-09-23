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
  const [clientesLoading, setClientesLoading] = useState(true);
  const [clientesError, setClientesError] = useState("");
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
      setClientesLoading(true);
      setClientesError("");
      const response = await clientesAPI.getAllClientes();
      setClientes(response.data?.data || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setClientes([]);
      setClientesError("Não foi possível carregar os clientes.");
      setMessage("Não foi possível carregar os clientes.");
      setMessageType("error");
    } finally {
      setClientesLoading(false);
    }
  };

  const fetchProcessos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await processosAPI.getAllProcessos();
      setProcessos(response.data?.data || []);
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

  // Exemplo simples usando fetch() (sem axios) para a AV2
  const fetchProcessosWithFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const res = await fetch(`${base}/processos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Erro na resposta");
      const data = await res.json();
      setProcessos(data?.data || []);
    } catch (err) {
      console.error("fetch() error:", err);
      setError("Não foi possível carregar os processos.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-semibold" style={{ color: '#f5f1e8' }}>Processos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: '#a6a6a6' }}>
            Gerencie os processos jurídicos cadastrados no sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewProcesso}
          className="btn btn-primary"
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
          clientesLoading={clientesLoading}
          clientesError={clientesError}
          onClose={handleCloseForm}
          onSave={handleSaveProcesso}
        />
      )}

      <ProcessosFetch />
    </div>
  );
}
