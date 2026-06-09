import { useState, useEffect } from "react";
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
  Legend,
} from "recharts";

export default function Dashboard() {
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
        <div className="dashboard-loading">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  const resumo = metrics?.resumo || {};
  const processosPorStatus = metrics?.processosPorStatus || [];
  const processosPorPrioridade = metrics?.processosPorPrioridade || [];
  const processosPorArea = metrics?.processosPorArea || [];
  const proximosVencimentos = metrics?.proximosVencimentos || [];

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
          onClick={() => (window.location.hash = "#processos")}
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
          <div className="pill-grid">
            {processosPorPrioridade.map((item) => (
              <div key={item.prioridade} className="summary-pill">
                <div>{item.prioridade}</div>
                <div>{item.quantidade}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel summary-panel">
          <h2>Distribuição por área</h2>
          <p className="dashboard-copy">
            Veja o volume de processos por área do direito em um gráfico de
            barras.
          </p>

          <div className="area-chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={processosPorArea}
                margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#334155"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="area"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "16px",
                    color: "#f8fafc",
                  }}
                  cursor={{ fill: "rgba(56, 189, 248, 0.12)" }}
                />
                <Legend
                  wrapperStyle={{ color: "#cbd5e1", paddingTop: 12 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="quantidade"
                  name="Processos"
                  fill="#38bdf8"
                  radius={[12, 12, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pill-grid mt-6">
            {processosPorArea.map((item) => (
              <div key={item.area} className="summary-pill">
                <div>{item.area}</div>
                <div>{item.quantidade}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
