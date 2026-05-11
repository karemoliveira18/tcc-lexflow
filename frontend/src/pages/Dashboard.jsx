import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import MetricCard from '../components/MetricCard';
import Button from '../components/Button';
import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMetrics();
      setMetrics(response.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const resumo = metrics?.resumo || {};
  const processosPorStatus = metrics?.processosPorStatus || [];
  const processosPorPrioridade = metrics?.processosPorPrioridade || [];
  const processosPorArea = metrics?.processosPorArea || [];

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral das operações e processos</p>
        </div>
        <Button variant="primary" onClick={() => window.location.hash = '#processos'}>
          Ver Processos
        </Button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Processos Ativos"
          value={resumo.totalProcessos ?? 0}
          description="Total de processos cadastrados"
          icon={FileText}
        />
        <MetricCard
          title="Total de Clientes"
          value={resumo.totalClientes ?? 0}
          description="Clientes ativos no sistema"
          icon={Users}
        />
        <MetricCard
          title="Processos Vencidos"
          value={resumo.processosVencidos ?? 0}
          description="Processos com prazo expirado"
          icon={AlertCircle}
        />
        <MetricCard
          title="Taxa de Conclusão"
          value={
            resumo.totalProcessos > 0
              ? `${Math.round((processosPorStatus.find((item) => item.status === 'concluído')?.quantidade || 0) / resumo.totalProcessos * 100)}%`
              : '0%'
          }
          description="Percentual de processos concluídos"
          icon={TrendingUp}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Processos por Status</h3>
          {processosPorStatus.length ? (
            processosPorStatus.map((item) => (
              <div key={item.status} className="chart-row">
                <span>{getStatusLabel(item.status)}</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: `${Math.max(10, (item.quantidade / Math.max(resumo.totalProcessos, 1)) * 100)}%` }} />
                </div>
                <span>{item.quantidade}</span>
              </div>
            ))
          ) : (
            <p>Nenhum processo cadastrado.</p>
          )}
        </div>

        <div className="chart-container">
          <h3>Processos por Prioridade</h3>
          {processosPorPrioridade.length ? (
            processosPorPrioridade.map((item) => (
              <div key={item.prioridade} className="priority-item">
                <span>{item.prioridade}</span>
                <span>{item.quantidade}</span>
              </div>
            ))
          ) : (
            <p>Nenhum processo cadastrado.</p>
          )}
        </div>
      </div>

      <div className="chart-container full-width">
        <h3>Distribuição por Área</h3>
        {processosPorArea.length ? (
          processosPorArea.map((item) => (
            <div key={item.area} className="area-item">
              <span>{item.area}</span>
              <span>{item.quantidade}</span>
            </div>
          ))
        ) : (
          <p>Nenhum processo cadastrado.</p>
        )}
      </div>
    </div>
  );
}
