import { useState } from "react";
import { Check, Trash2, Edit2 } from "lucide-react";
import { processosAPI } from "../api";
import { getApiErrorMessage } from "../utils/apiErrorMessage";

const formatDateOnly = (value) => {
  const [year, month, day] = String(value || "").split("T")[0].split("-");
  return year && month && day ? `${day}/${month}/${year}` : "-";
};

const isOverdue = (value) => {
  const [year, month, day] = String(value || "").split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return false;

  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline < today;
};

export default function ProcessosTable({
  processos,
  loading,
  error,
  onEdit,
  onRefresh,
  onMessage,
}) {
  const [statusFilter, setStatusFilter] = useState("todos");

  const filteredProcessos = (processos || []).filter((processo) => {
    if (statusFilter === "ativos") return processo.status === "ativo";
    if (statusFilter === "concluidos") return processo.status === "concluído";
    return true;
  });

  const handleComplete = async (processo) => {
    if (!window.confirm(`Concluir o processo “${processo.titulo}”?`)) return;

    try {
      await processosAPI.updateProcesso(processo.id, { status: "concluído" });
      onMessage?.("Processo concluído com sucesso.", "success");
      onRefresh?.();
    } catch (err) {
      onMessage?.(getApiErrorMessage(err, "Não foi possível concluir o processo."), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este processo permanentemente?")) {
      return;
    }

    try {
      await processosAPI.deleteProcesso(id);
      onMessage?.("Processo excluído com sucesso.", "success");
      onRefresh?.();
    } catch (err) {
      onMessage?.(getApiErrorMessage(err, "Não foi possível excluir o processo."), "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border p-8 shadow-sm" aria-live="polite" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: '#111111' }}>
        <p className="mb-4 text-sm font-medium" style={{ color: '#f5f1e8' }}>Carregando processos...</p>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/5 rounded" style={{ background: 'rgba(212, 175, 55, 0.2)' }} />
          <div className="h-4 w-full rounded" style={{ background: 'rgba(212, 175, 55, 0.2)' }} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-24 rounded" style={{ background: 'rgba(212, 175, 55, 0.2)' }} />
            <div className="h-24 rounded" style={{ background: 'rgba(212, 175, 55, 0.2)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="processos-table-error" role="alert">
        <p className="font-semibold">Erro ao carregar processos</p>
        <p className="mt-2 text-sm">Não foi possível carregar os processos.</p>
      </div>
    );
  }

  if (!processos || processos.length === 0) {
    return (
      <div className="rounded-3xl border p-8 shadow-sm text-center" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: '#111111' }}>
        <p className="text-xl font-semibold" style={{ color: '#f5f1e8' }}>
          Nenhum processo cadastrado.
        </p>
        <p className="mt-2 text-sm" style={{ color: '#a6a6a6' }}>
          Cadastre um processo para começar a acompanhar sua rotina jurídica.
        </p>
      </div>
    );
  }

  return (
    <div className="processos-table-card overflow-hidden rounded-3xl border shadow-sm" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: '#111111' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: '#0d0d0d' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#f5f1e8' }}>
              Processos cadastrados
            </h2>
            <p className="text-sm" style={{ color: '#a6a6a6' }}>
              Gerencie os processos jurídicos cadastrados no sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition"
            style={{ borderColor: 'rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="processos-status-filters" role="group" aria-label="Filtrar processos por status">
        {[
          { id: "todos", label: "Todos" },
          { id: "ativos", label: "Ativos" },
          { id: "concluidos", label: "Concluídos" },
        ].map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            aria-pressed={statusFilter === filter.id}
            className={`processos-status-filter${statusFilter === filter.id ? " is-active" : ""}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        {filteredProcessos.length === 0 ? (
          <div className="processos-filter-empty" role="status">
            {processos.length === 0
              ? "Nenhum processo cadastrado."
              : "Nenhum processo corresponde a este filtro."}
          </div>
        ) : <table className="processos-data-table min-w-full text-sm" style={{ background: '#111111', color: '#f5f1e8' }}>
          <thead style={{ background: '#0b0b0b' }}>
            <tr>
              <th className="px-6 py-4 text-left font-semibold" style={{ color: '#d4af37' }}>Título</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ color: '#d4af37' }}>Área</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ color: '#d4af37' }}>Cliente</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ color: '#d4af37' }}>Prazo</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ color: '#d4af37' }}>Status</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ color: '#d4af37' }}>Prioridade</th>
              <th className="px-6 py-4 text-right font-semibold" style={{ color: '#d4af37' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcessos.map((processo) => {
              const overdue = processo.status !== "concluído" && isOverdue(processo.prazo);
              return (
              <tr key={processo.id} style={{ borderTop: '1px solid rgba(212, 175, 55, 0.08)' }}>
                <td className="processos-title-cell px-6 py-4 font-medium" style={{ color: '#f5f1e8' }}>
                  {processo.titulo}
                </td>
                <td className="processos-wrap-cell px-6 py-4" style={{ color: '#a6a6a6' }}>
                  {processo.area}
                </td>
                <td className="processos-wrap-cell px-6 py-4" style={{ color: '#a6a6a6' }}>
                  {processo.cliente?.nome || "Sem cliente"}
                </td>
                <td className="px-6 py-4">
                  <span className={overdue ? "processos-deadline overdue" : "processos-deadline"}>
                    {formatDateOnly(processo.prazo)}
                  </span>
                  {overdue && <span className="processos-overdue-label">Vencido</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#f5d780' }}>
                    {processo.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#f5d780' }}>
                    {processo.prioridade}
                  </span>
                </td>
                <td className="px-6 py-4 text-right" style={{ color: '#a6a6a6' }}>
                  <div className="processos-row-actions">
                    <button
                      type="button"
                      onClick={() => onEdit?.(processo)}
                      className="processos-action-button edit"
                      style={{ borderColor: 'rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#d4af37' }}
                      title="Editar"
                      aria-label={`Editar ${processo.titulo}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    {processo.status !== "concluído" && (
                      <button
                        type="button"
                        onClick={() => handleComplete(processo)}
                        className="processos-action-button complete"
                        title="Concluir processo"
                        aria-label={`Concluir ${processo.titulo}`}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(processo.id)}
                        className="processos-action-button delete"
                      title="Excluir"
                      aria-label={`Excluir ${processo.titulo}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
