import { Trash2, Edit2 } from "lucide-react";
import { processosAPI } from "../api";

const formatDateOnly = (value) => {
  const [year, month, day] = String(value || "").split("T")[0].split("-");
  return year && month && day ? `${day}/${month}/${year}` : "-";
};

export default function ProcessosTable({
  processos,
  loading,
  error,
  onEdit,
  onRefresh,
  onMessage,
}) {
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este processo?")) {
      return;
    }

    try {
      await processosAPI.deleteProcesso(id);
      onMessage?.("Processo excluído com sucesso.", "success");
      onRefresh?.();
    } catch (err) {
      onMessage?.("Erro ao excluir o processo.", "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border p-8 shadow-sm" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: '#111111' }}>
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
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
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
    <div className="overflow-hidden rounded-3xl border shadow-sm" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', background: '#111111' }}>
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

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" style={{ background: '#111111', color: '#f5f1e8' }}>
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
            {processos.map((processo) => (
              <tr key={processo.id} style={{ borderTop: '1px solid rgba(212, 175, 55, 0.08)' }}>
                <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: '#f5f1e8' }}>
                  {processo.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#a6a6a6' }}>
                  {processo.area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#a6a6a6' }}>
                  {processo.cliente?.nome || "Sem cliente"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#a6a6a6' }}>
                  {formatDateOnly(processo.prazo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#f5d780' }}>
                    {processo.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#f5d780' }}>
                    {processo.prioridade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right" style={{ color: '#a6a6a6' }}>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(processo)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{ borderColor: 'rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#d4af37' }}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(processo.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{ borderColor: 'rgba(255, 107, 107, 0.35)', background: 'rgba(200, 80, 80, 0.12)', color: '#ffb4b4' }}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
