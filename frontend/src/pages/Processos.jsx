import { useState, useEffect } from "react";
import { processosAPI, clientesAPI } from "../api";
import ProcessosTable from "../components/ProcessosTable";
import ProcessoForm from "../components/ProcessoForm";
import Alert from "../components/Alert";
import MetricCard from "../components/MetricCard";
import { getApiErrorMessage } from "../utils/apiErrorMessage";
import { CalendarDays, CheckCircle2, Clock3, FileText, Plus } from "lucide-react";

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
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        throw new Error("A API retornou uma lista de clientes em formato inválido.");
      }
      setClientes(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setClientes([]);
      const messageText = err.response
        ? getApiErrorMessage(err, "Não foi possível carregar os clientes.")
        : err.message || "Não foi possível carregar os clientes.";
      setClientesError(messageText);
      setMessage(messageText);
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
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        throw new Error('Resposta inválida ao carregar processos.');
      }
      setProcessos(data);
    } catch (err) {
      console.error("Erro ao carregar processos:", err);
      const apiError = err.response?.data?.error;
      setError(
        (typeof apiError === "string" ? apiError : apiError?.message)
        || err.response?.data?.message
        || err.message
        || "Não foi possível carregar os processos.",
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

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const emSeteDias = new Date(hoje);
  emSeteDias.setDate(emSeteDias.getDate() + 7);
  const prazosProximos = processos.filter((processo) => {
    if (processo.status === "concluído") return false;
    const [ano, mes, dia] = String(processo.prazo || "").split("T")[0].split("-").map(Number);
    if (!ano || !mes || !dia) return false;
    const prazo = new Date(ano, mes - 1, dia);
    return prazo >= hoje && prazo <= emSeteDias;
  }).length;

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

      <div className="processos-metrics-grid">
        <MetricCard
          title="Total de processos"
          value={processos.length}
          description="Todos os processos cadastrados"
          icon={FileText}
        />
        <MetricCard
          title="Processos ativos"
          value={processos.filter((processo) => processo.status === "ativo").length}
          description="Processos em andamento"
          icon={Clock3}
        />
        <MetricCard
          title="Processos concluídos"
          value={processos.filter((processo) => processo.status === "concluído").length}
          description="Processos finalizados"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Prazos próximos"
          value={prazosProximos}
          description="Vencimentos nos próximos 7 dias"
          icon={CalendarDays}
        />
      </div>

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

    </div>
  );
}
