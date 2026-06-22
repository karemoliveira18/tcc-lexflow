import { Trash2, Edit2 } from "lucide-react";
import { processosAPI } from "../api";

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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/5 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-24 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <p className="font-semibold">Erro ao carregar processos</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  if (!processos || processos.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <p className="text-xl font-semibold text-slate-900">
          Nenhum processo encontrado
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre um novo processo para começar a acompanhar os processos.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Processos ativos
            </h2>
            <p className="text-sm text-slate-600">
              Dados carregados diretamente da API.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Título</th>
              <th className="px-6 py-4 text-left font-semibold">Área</th>
              <th className="px-6 py-4 text-left font-semibold">Cliente</th>
              <th className="px-6 py-4 text-left font-semibold">Prazo</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Prioridade</th>
              <th className="px-6 py-4 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {processos.map((processo) => (
              <tr key={processo.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                  {processo.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {processo.area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {processo.cliente?.nome || "Sem cliente"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {new Date(processo.prazo).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {processo.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {processo.prioridade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(processo)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(processo.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
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
