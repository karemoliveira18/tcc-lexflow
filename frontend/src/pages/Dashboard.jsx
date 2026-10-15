import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../api";
import MetricCard from "../components/MetricCard";
import Button from "../components/Button";
import {
  FileText,
  CheckCircle2,
  Clock3,
  CalendarDays,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMetrics();
      setMetrics(response.data);
      setError("");
    } catch (err) {
      setError("Erro ao carregar métricas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading" role="status">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error" role="alert">{error}</div>
      </div>
    );
  }

  const resumo = metrics?.resumo || {};
  const processosPorStatus = metrics?.processosPorStatus || [];
  const processosPorPrioridade = (Array.isArray(metrics?.processosPorPrioridade)
    ? metrics.processosPorPrioridade
    : [])
    .map((item) => ({ ...item, quantidade: Number(item.quantidade) }))
    .filter((item) => typeof item.prioridade === "string" && Number.isFinite(item.quantidade) && item.quantidade >= 0);
  const processosPorArea = (Array.isArray(metrics?.processosPorArea)
    ? metrics.processosPorArea
    : [])
    .map((item) => ({ ...item, quantidade: Number(item.quantidade) }))
    .filter((item) => typeof item.area === "string" && Number.isFinite(item.quantidade) && item.quantidade >= 0);
  const proximosVencimentos = metrics?.proximosVencimentos || [];
  const totalPrioridades = processosPorPrioridade.reduce((total, item) => total + item.quantidade, 0);
  const maxProcessosPorArea = Math.max(0, ...processosPorArea.map((item) => item.quantidade));
  const areaChartHeight = Math.max(180, processosPorArea.length * 52 + 32);

  const statusTotal = resumo.totalProcessos || 0;
  const taxaConclusao =
    statusTotal > 0
      ? `${Math.round(((processosPorStatus.find((item) => item.status === "concluído")?.quantidade || 0) / statusTotal) * 100)}%`
      : "0%";

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-page container">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-label">LexFlow</p>
          <h1>Visão estratégica dos processos</h1>
          <p className="dashboard-copy">
            Acompanhe os principais indicadores do escritório com dados reais do
            backend e prazos críticos em um único painel.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/processos")}
        >
          Acessar Processos
        </Button>
      </div>

      <div className="dashboard-cards-grid">
        <MetricCard
          title="Total de Processos"
          value={resumo.totalProcessos ?? 0}
          description="Todos os processos cadastrados"
          icon={FileText}
          trend="up"
          trendValue={`${resumo.totalProcessos ?? 0} itens`}
        />
        <MetricCard
          title="Processos Ativos"
          value={resumo.processosAtivos ?? 0}
          description="Processos em andamento"
          icon={Clock3}
          trend="up"
          trendValue={
            resumo.processosAtivos
              ? `${resumo.processosAtivos} ativos`
              : "Nenhum"
          }
        />
        <MetricCard
          title="Processos Concluídos"
          value={resumo.processosConcluidos ?? 0}
          description="Resultados entregues"
          icon={CheckCircle2}
          trend="down"
          trendValue={
            resumo.processosConcluidos
              ? `${resumo.processosConcluidos} finalizados`
              : "0 finalizados"
          }
        />
        <MetricCard
          title="Prazos Próximos"
          value={resumo.proximosVencimentosCount ?? 0}
          description="Processos com vencimento nos próximos 7 dias"
          icon={CalendarDays}
          trend="up"
          trendValue={
            resumo.processosVencidos
              ? `${resumo.processosVencidos} atrasados`
              : "Sem atrasos"
          }
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Performance de status</h2>
              <p>Distribuição dos processos por situação atual.</p>
            </div>
            <span className="status-chip">Total {statusTotal}</span>
          </div>

          <div className="status-group">
            {processosPorStatus.map((item) => {
              const percent = statusTotal
                ? Math.round((item.quantidade / statusTotal) * 100)
                : 0;
              return (
                <div key={item.status} className="dashboard-status-row">
                  <div className="status-title">
                    <span>{getStatusLabel(item.status)}</span>
                    <span>{item.quantidade}</span>
                  </div>
                  <div className="status-bar">
                    <div
                      className="status-fill"
                      style={{ width: `${Math.max(10, percent)}%` }}
                    />
                  </div>
                  <span className="status-percent">{percent}%</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Prazos próximos</h2>
              <p>Lista dos processos mais urgentes para os próximos dias.</p>
            </div>
            <span className="status-chip status-chip-alt">
              {proximosVencimentos.length} registros
            </span>
          </div>

          <div className="dashboard-list">
            {proximosVencimentos.length ? (
              proximosVencimentos.map((processo) => (
                <div key={processo.id} className="dashboard-list-item">
                  <div>
                    <p className="item-title">{processo.titulo}</p>
                    <p className="item-meta">
                      {processo.cliente} · {processo.prioridade}
                    </p>
                  </div>
                  <div className="item-badge">{formatDate(processo.prazo)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <AlertCircle size={20} className="empty-icon" />
                <p>Não há prazos críticos definidos para os próximos 7 dias.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-grid dashboard-summary-grid">
        <section className="dashboard-panel summary-panel">
          <h2>Prioridade dos processos</h2>
          {totalPrioridades === 0 ? (
            <div className="dashboard-chart-empty" role="status">
              Não há processos para exibir por prioridade.
            </div>
          ) : (
            <div className="priority-bars" aria-label="Processos por prioridade">
              {processosPorPrioridade.map((item) => {
                const percent = Math.round((item.quantidade / totalPrioridades) * 100);
                return (
                  <div key={item.prioridade} className="priority-bar-row">
                    <div className="priority-bar-heading">
                      <span>{item.prioridade.charAt(0).toLocaleUpperCase("pt-BR") + item.prioridade.slice(1)}</span>
                      <span>{item.quantidade} · {percent}%</span>
                    </div>
                    <div
                      className="priority-bar-track"
                      role="progressbar"
                      aria-label={`${item.prioridade}: ${item.quantidade} processos`}
                      aria-valuemin={0}
                      aria-valuemax={totalPrioridades}
                      aria-valuenow={item.quantidade}
                    >
                      <div className="priority-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-panel summary-panel">
          <h2>Distribuição por área</h2>
          {processosPorArea.length === 0 ? (
            <div className="dashboard-chart-empty" role="status">
              Não há processos cadastrados para exibir por área.
            </div>
          ) : (
            <div className="area-chart-wrapper" aria-label="Quantidade de processos por área">
            <ResponsiveContainer width="100%" height={areaChartHeight}>
              <BarChart
                layout="vertical"
                data={processosPorArea}
                margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, Math.max(1, maxProcessosPorArea)]}
                  allowDecimals={false}
                  tick={{ fill: "#a6a6a6", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="area"
                  width={112}
                  tickFormatter={(area) => area.charAt(0).toLocaleUpperCase("pt-BR") + area.slice(1)}
                  tick={{ fill: "#f5f1e8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#121212",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    borderRadius: "16px",
                    color: "#f8fafc",
                  }}
                  cursor={{ fill: "rgba(212, 175, 55, 0.12)" }}
                />
                <Bar
                  dataKey="quantidade"
                  name="Processos"
                  fill="#D4AF37"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={28}
                >
                  <LabelList
                    dataKey="quantidade"
                    position="right"
                    fill="#f5f1e8"
                    fontSize={12}
                    fontWeight={700}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
