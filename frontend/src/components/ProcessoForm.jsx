import { useState, useEffect } from "react";
import { processosAPI } from "../api";
import { X } from "lucide-react";

const initialFormData = {
  titulo: "",
  area: "",
  prazo: "",
  status: "ativo",
  descricao: "",
  prioridade: "normal",
  clienteId: "",
};

export default function ProcessoForm({ processo, clientes, clientesLoading, clientesError, onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  useEffect(() => {
    if (processo) {
      const cliente = clientes.find((item) => item.id === processo.clienteId) || processo.cliente || null;
      setFormData({
        titulo: processo.titulo,
        area: processo.area,
        prazo: processo.prazo?.split("T")[0] || "",
        status: processo.status,
        descricao: processo.descricao || "",
        prioridade: processo.prioridade,
        clienteId: processo.clienteId,
      });
      setClienteSelecionado(cliente);
      setClienteBusca(cliente?.nome || "");
    } else {
      setFormData(initialFormData);
      setError("");
      setClienteSelecionado(null);
      setClienteBusca("");
    }
  }, [processo, clientes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (processo) {
        await processosAPI.updateProcesso(processo.id, formData);
        onSave?.("Processo atualizado com sucesso.", "success");
      } else {
        await processosAPI.createProcesso(formData);
        onSave?.("Processo cadastrado com sucesso.", "success");
      }
      onClose?.();
    } catch (err) {
      const apiError = err.response?.data?.error;
      const errorMessage =
        (typeof apiError === "string" ? apiError : apiError?.message)
        || err.response?.data?.message
        || "Erro ao salvar processo";
      setError(errorMessage);
      onSave?.(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLocaleLowerCase().includes(clienteBusca.trim().toLocaleLowerCase()),
  );

  const handleClienteBuscaChange = (event) => {
    setClienteBusca(event.target.value);
    setClienteSelecionado(null);
    setFormData((prev) => ({ ...prev, clienteId: "" }));
    setMostrarSugestoes(true);
  };

  const handleClienteSelect = (cliente) => {
    setClienteSelecionado(cliente);
    setClienteBusca(cliente.nome);
    setFormData((prev) => ({ ...prev, clienteId: cliente.id }));
    setMostrarSugestoes(false);
  };

  const handleClienteClear = () => {
    setClienteSelecionado(null);
    setClienteBusca("");
    setFormData((prev) => ({ ...prev, clienteId: "" }));
    setMostrarSugestoes(false);
  };

  return (
    <div className="processo-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="processo-modal w-full rounded-3xl p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: '#f5f1e8' }}>
              {processo ? "Editar Processo" : "Novo Processo"}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#a6a6a6' }}>
              Preencha os dados do processo para sincronizar com o backend.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition"
            style={{ borderColor: 'rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="processo-form space-y-5">
          {error && (
            <div className="processo-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="processo-form-grid processo-form-grid-primary">
            <label className="space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
              Título *
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ border: '1px solid rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
              />
            </label>

            <label className="space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
              Área *
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ border: '1px solid rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
              />
            </label>
          </div>

          <div className="processo-form-grid processo-form-grid-secondary">
            <label className="processo-client-field space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
              Cliente *
              <div className="processo-client-autocomplete">
                <div className="processo-client-input-wrap">
                  <input
                    type="text"
                    value={clienteBusca}
                    onChange={handleClienteBuscaChange}
                    onFocus={() => setMostrarSugestoes(Boolean(clienteBusca.trim()) && !clienteSelecionado)}
                    placeholder={clientesLoading ? "Carregando clientes..." : "Digite o nome do cliente..."}
                    disabled={clientesLoading || Boolean(clientesError)}
                    required={!formData.clienteId}
                    autoComplete="off"
                  />
                  {clienteSelecionado && (
                    <button
                      type="button"
                      className="processo-client-clear"
                      onClick={handleClienteClear}
                      aria-label="Remover cliente selecionado"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {mostrarSugestoes && !clientesLoading && !clientesError && (
                  <div className="processo-client-suggestions" role="listbox">
                    {clientesFiltrados.length > 0 ? clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        className="processo-client-suggestion"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleClienteSelect(cliente)}
                      >
                        <strong>{cliente.nome}</strong>
                        {cliente.cpfCnpj && <span>CPF/CNPJ: {cliente.cpfCnpj}</span>}
                      </button>
                    )) : (
                      <p className="processo-client-empty">Cliente não encontrado.</p>
                    )}
                  </div>
                )}
                {!clientesLoading && clientesError && <p className="processo-client-feedback">{clientesError}</p>}
                {!clientesLoading && !clientesError && clientes.length === 0 && <p className="processo-client-feedback">Nenhum cliente cadastrado.</p>}
              </div>
            </label>

            <label className="space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
              Prazo *
              <input
                type="date"
                name="prazo"
                value={formData.prazo}
                onChange={handleChange}
                required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ border: '1px solid rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
              />
            </label>
          </div>

          <div className="processo-form-grid processo-form-grid-options">
            <label className="space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
              Prioridade
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ border: '1px solid rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
              Status
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ border: '1px solid rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
              >
                <option value="ativo">Ativo</option>
                <option value="aguardando">Aguardando</option>
                <option value="concluído">Concluído</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </label>
          </div>

          <label className="processo-description-field space-y-2 text-sm font-medium" style={{ color: '#f5f1e8' }}>
            Descrição
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{ border: '1px solid rgba(212, 175, 55, 0.25)', background: '#0a0a0a', color: '#f5f1e8' }}
            />
          </label>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'rgba(212, 175, 55, 0.18)' }}>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border px-5 py-3 text-sm font-semibold transition"
              style={{ borderColor: 'rgba(212, 175, 55, 0.35)', background: '#151515', color: '#f5f1e8' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed"
              style={{ background: '#d4af37', color: '#050505' }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
