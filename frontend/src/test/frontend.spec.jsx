import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Dashboard from '../pages/Dashboard';
import Processos from '../pages/Processos';
import Clientes from '../pages/Clientes';
import ProcessosTable from '../components/ProcessosTable';
import Sidebar from '../components/Sidebar';
import Landing from '../pages/Landing';
import { dashboardAPI, clientesAPI, processosAPI } from '../api';
import { MemoryRouter, useLocation } from 'react-router-dom';

jest.mock('../api', () => ({
  dashboardAPI: { getMetrics: jest.fn() },
  clientesAPI: {
    getAllClientes: jest.fn(),
    createCliente: jest.fn(),
    updateCliente: jest.fn(),
    deleteCliente: jest.fn(),
  },
  processosAPI: {
    getAllProcessos: jest.fn(),
    createProcesso: jest.fn(),
    updateProcesso: jest.fn(),
    deleteProcesso: jest.fn(),
  },
}));

const CurrentPath = () => {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
};

describe('LexFlow frontend behaviors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with the four main metric cards and texts', async () => {
    dashboardAPI.getMetrics.mockResolvedValue({
      data: {
        resumo: {
          totalProcessos: 12,
          processosAtivos: 7,
          processosConcluidos: 3,
          proximosVencimentosCount: 2,
        },
        processosPorStatus: [
          { status: 'ativo', quantidade: 7 },
          { status: 'concluído', quantidade: 3 },
        ],
        processosPorPrioridade: [],
        processosPorArea: [],
        proximosVencimentos: [],
      },
    });

    const { container } = render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText(/carregando dashboard/i)).toBeInTheDocument();

    expect(await screen.findByText(/total de processos/i)).toBeInTheDocument();
    expect(screen.getByText(/processos ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/processos concluídos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/prazos próximos/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/visão estratégica dos processos/i)).toBeInTheDocument();
    const cards = container.querySelectorAll('.dashboard-cards-grid > .metric-card');
    expect(cards).toHaveLength(4);
    cards.forEach((card) => {
      expect(card).toHaveClass('min-w-0', 'w-full');
      expect(card.querySelector('.metric-label')).toBeInTheDocument();
      expect(card.querySelector('.metric-description')).toBeInTheDocument();
    });
  });

  it('renders one horizontal area bar with value 1 for each real area group', async () => {
    const originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = class ResizeObserverMock {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {
        this.callback([{ contentRect: { width: 680, height: 220 } }]);
      }

      unobserve() {}

      disconnect() {}
    };

    dashboardAPI.getMetrics.mockResolvedValue({
      data: {
        resumo: { totalProcessos: 2, processosAtivos: 2, processosConcluidos: 0, proximosVencimentosCount: 0 },
        processosPorStatus: [{ status: 'ativo', quantidade: 2 }],
        processosPorPrioridade: [
          { prioridade: 'normal', quantidade: 1 },
          { prioridade: 'alta', quantidade: 1 },
        ],
        processosPorArea: [
          { area: 'Direito Civil', quantidade: 1 },
          { area: 'Criminal', quantidade: 1 },
        ],
        proximosVencimentos: [],
      },
    });

    try {
      const { container } = render(<MemoryRouter><Dashboard /></MemoryRouter>);
      expect(await screen.findByText('Distribuição por área')).toBeInTheDocument();
      await waitFor(() => {
        const barShapes = container.querySelectorAll('.recharts-bar-rectangle .recharts-rectangle');
        expect(barShapes).toHaveLength(2);
        barShapes.forEach((shape) => expect(shape).toHaveAttribute('fill', '#D4AF37'));
        expect([...container.querySelectorAll('.recharts-label-list text')].map((label) => label.textContent)).toEqual(['1', '1']);
      });
      expect(container.querySelector('.area-chart-wrapper')).toHaveTextContent('Direito Civil');
      expect(container.querySelector('.area-chart-wrapper')).toHaveTextContent('Criminal');
      expect(container.querySelectorAll('.priority-bar-row')).toHaveLength(2);
      expect(container.querySelectorAll('.priority-bar-heading')).toHaveLength(2);
      expect(container.querySelectorAll('.priority-bar-heading')[0]).toHaveTextContent('1 · 50%');
      expect(container.querySelectorAll('.priority-bar-heading')[1]).toHaveTextContent('1 · 50%');
    } finally {
      if (originalResizeObserver) global.ResizeObserver = originalResizeObserver;
      else delete global.ResizeObserver;
    }
  });

  it('shows empty dashboard chart states when there are no processes', async () => {
    dashboardAPI.getMetrics.mockResolvedValue({
      data: {
        resumo: { totalProcessos: 0 },
        processosPorStatus: [],
        processosPorPrioridade: [],
        processosPorArea: [],
        proximosVencimentos: [],
      },
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(await screen.findByText(/não há processos para exibir por prioridade/i)).toBeInTheDocument();
    expect(screen.getByText(/não há processos cadastrados para exibir por área/i)).toBeInTheDocument();
  });

  it('shows an error state when dashboard metrics cannot be loaded', async () => {
    dashboardAPI.getMetrics.mockRejectedValue(new Error('Network failure'));

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar métricas');
  });

  it('navigates from the dashboard button to the existing protected Processos route', async () => {
    dashboardAPI.getMetrics.mockResolvedValue({
      data: {
        resumo: { totalProcessos: 0 },
        processosPorStatus: [],
        processosPorPrioridade: [],
        processosPorArea: [],
        proximosVencimentos: [],
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
        <CurrentPath />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /acessar processos/i }));

    expect(screen.getByTestId('current-path')).toHaveTextContent('/processos');
  });

  it('renders the Processos page and the main button', async () => {
    processosAPI.getAllProcessos.mockResolvedValue({ data: { data: [] } });
    clientesAPI.getAllClientes.mockResolvedValue({ data: { data: [] } });

    render(<Processos />);

    expect(await screen.findByRole('heading', { name: /processos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo processo/i })).toBeInTheDocument();
  });

  it('renders loading and error states for the processos table', () => {
    const { rerender } = render(
      <ProcessosTable
        processos={[]}
        loading={true}
        error=""
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();

    rerender(
      <ProcessosTable
        processos={[]}
        loading={false}
        error="Erro ao carregar processos"
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText(/erro ao carregar processos/i)).toBeInTheDocument();
  });

  it('marks overdue open processes but not completed historical processes', () => {
    render(
      <ProcessosTable
        processos={[
          { id: 'open-past', titulo: 'Processo ativo vencido', area: 'Civil', cliente: { nome: 'Cliente Teste' }, prazo: '2020-01-01', status: 'ativo', prioridade: 'normal' },
          { id: 'closed-past', titulo: 'Processo concluído histórico', area: 'Civil', cliente: { nome: 'Cliente Teste' }, prazo: '2020-01-01', status: 'concluído', prioridade: 'normal' },
        ]}
        loading={false}
        error=""
      />,
    );

    expect(screen.getByText('Vencido')).toBeInTheDocument();
    expect(screen.getAllByText('01/01/2020')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /concluir processo concluído histórico/i })).not.toBeInTheDocument();
  });

  it('confirms completion, uses the existing update API and refreshes the metrics', async () => {
    const activeProcess = {
      id: 'processo-ativo',
      titulo: 'Processo para concluir',
      area: 'Direito Civil',
      clienteId: 'cliente-1',
      cliente: { id: 'cliente-1', nome: 'Empresa Teste' },
      prazo: '2030-12-31',
      status: 'ativo',
      prioridade: 'normal',
    };
    const completedProcess = { ...activeProcess, status: 'concluído' };
    processosAPI.getAllProcessos
      .mockResolvedValueOnce({ data: { data: [activeProcess] } })
      .mockResolvedValue({ data: { data: [completedProcess] } });
    clientesAPI.getAllClientes.mockResolvedValue({ data: { data: [] } });
    processosAPI.updateProcesso.mockResolvedValue({ data: completedProcess });
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { container } = render(<Processos />);

    fireEvent.click(await screen.findByRole('button', { name: /concluir processo para concluir/i }));

    await waitFor(() => {
      expect(processosAPI.updateProcesso).toHaveBeenCalledWith('processo-ativo', { status: 'concluído' });
      const values = [...container.querySelectorAll('.processos-metrics-grid .metric-value')].map((node) => node.textContent);
      expect(values.slice(0, 3)).toEqual(['1', '0', '1']);
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(await screen.findByText('concluído')).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it('filters processes by all, active and completed status', () => {
    render(
      <ProcessosTable
        processos={[
          { id: 'active', titulo: 'Processo ativo', area: 'Civil', prazo: '2030-01-01', status: 'ativo', prioridade: 'normal' },
          { id: 'closed', titulo: 'Processo concluído', area: 'Civil', prazo: '2020-01-01', status: 'concluído', prioridade: 'normal' },
        ]}
        loading={false}
        error=""
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ativos' }));
    expect(screen.getByText('Processo ativo')).toBeInTheDocument();
    expect(screen.queryByText('Processo concluído')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Concluídos' }));
    expect(screen.getByText('Processo concluído')).toBeInTheDocument();
    expect(screen.queryByText('Processo ativo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getByText('Processo ativo')).toBeInTheDocument();
    expect(screen.getByText('Processo concluído')).toBeInTheDocument();
  });

  it('asks before permanent deletion and leaves the record untouched when cancelled', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <ProcessosTable
        processos={[{ id: 'processo-preservado', titulo: 'Processo preservado', area: 'Civil', prazo: '2030-01-01', status: 'ativo', prioridade: 'normal' }]}
        loading={false}
        error=""
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /excluir processo preservado/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(processosAPI.deleteProcesso).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('opens, fills and submits the client form successfully', async () => {
    const persistedClient = {
      id: 'cliente-novo',
      nome: 'Maria Silva',
      cpfCnpj: '52998224725',
      email: 'maria@email.com',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: 'SP',
      cep: '',
      observacoes: '',
    };
    clientesAPI.getAllClientes
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValue({ data: { data: [persistedClient] } });
    clientesAPI.createCliente.mockResolvedValue({ data: { success: true } });

    render(<Clientes />);

    fireEvent.click(screen.getByRole('button', { name: /novo cliente/i }));

    fireEvent.change(screen.getByLabelText(/nome \*/i), {
      target: { name: 'nome', value: 'Maria Silva' },
    });
    fireEvent.change(screen.getByLabelText(/cpf\/cnpj \*/i), {
      target: { name: 'cpfCnpj', value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: 'email', value: 'maria@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/estado/i), {
      target: { name: 'estado', value: 'sp' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(clientesAPI.createCliente).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Maria Silva',
          cpfCnpj: '52998224725',
          email: 'maria@email.com',
          estado: 'SP',
        }),
      );
    });

    expect(screen.queryByRole('heading', { name: /novo cliente/i })).not.toBeInTheDocument();
    expect(await screen.findByText(/cliente cadastrado com sucesso/i)).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: 'Maria Silva' })).toBeInTheDocument();
    expect(clientesAPI.getAllClientes).toHaveBeenCalledTimes(2);
  });

  it('opens, fills and submits the processo form successfully', async () => {
    processosAPI.getAllProcessos.mockResolvedValue({ data: { data: [] } });
    clientesAPI.getAllClientes.mockResolvedValue({
      data: { data: [{ id: 'cliente-1', nome: 'Empresa Teste', cpfCnpj: '123' }] },
    });
    processosAPI.createProcesso.mockResolvedValue({ data: { success: true } });

    render(<Processos />);

    fireEvent.click(await screen.findByRole('button', { name: /novo processo/i }));

    fireEvent.change(await screen.findByLabelText(/título \*/i), {
      target: { name: 'titulo', value: 'Ação trabalhista' },
    });
    fireEvent.change(screen.getByLabelText(/área \*/i), {
      target: { name: 'area', value: 'Direito Trabalhista' },
    });

    fireEvent.change(screen.getByPlaceholderText(/digite o nome do cliente/i), {
      target: { value: 'Empresa Teste' },
    });
    fireEvent.click(screen.getByText(/empresa teste/i));

    fireEvent.change(screen.getByLabelText(/prazo \*/i), {
      target: { name: 'prazo', value: '2030-12-31' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(processosAPI.createProcesso).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Ação trabalhista',
          area: 'Direito Trabalhista',
          prazo: '2030-12-31',
          clienteId: 'cliente-1',
        }),
      );
    });

    expect(await screen.findByText(/processo cadastrado com sucesso/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /novo processo/i })).not.toBeInTheDocument();
  });

  it('keeps the client form visible and renders structured API errors as text', async () => {
    clientesAPI.getAllClientes.mockResolvedValue({ data: { data: [] } });
    clientesAPI.createCliente.mockRejectedValue({
      response: {
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: [{ field: 'cpfCnpj', message: 'CPF/CNPJ inválido' }],
          },
        },
      },
    });

    render(<Clientes />);
    fireEvent.click(screen.getByRole('button', { name: /novo cliente/i }));
    fireEvent.change(screen.getByLabelText(/nome \*/i), { target: { value: 'Maria Silva' } });
    fireEvent.change(screen.getByLabelText(/cpf\/cnpj \*/i), { target: { value: '12345678900' } });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('CPF/CNPJ: CPF/CNPJ inválido');
    expect(screen.getByRole('heading', { name: /novo cliente/i })).toBeInTheDocument();
  });

  it('explains that a client must be selected before a process can be created', async () => {
    processosAPI.getAllProcessos.mockResolvedValue({ data: { data: [] } });
    clientesAPI.getAllClientes.mockResolvedValue({ data: { data: [] } });

    render(<Processos />);
    fireEvent.click(await screen.findByRole('button', { name: /novo processo/i }));

    expect(await screen.findByText(/cadastre um cliente na tela clientes antes de criar um processo/i)).toBeInTheDocument();
    fireEvent.submit(document.querySelector('.processo-form'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/cadastre um cliente primeiro/i);
    expect(processosAPI.createProcesso).not.toHaveBeenCalled();
  });

  it('keeps the process form visible and renders structured API errors as text', async () => {
    processosAPI.getAllProcessos.mockResolvedValue({ data: { data: [] } });
    clientesAPI.getAllClientes.mockResolvedValue({
      data: { data: [{ id: 'cliente-1', nome: 'Empresa Teste', cpfCnpj: '123' }] },
    });
    processosAPI.createProcesso.mockRejectedValue({
      response: { data: { error: { code: 'CONFLICT', message: 'Prazo inválido' } } },
    });

    render(<Processos />);
    fireEvent.click(await screen.findByRole('button', { name: /novo processo/i }));
    fireEvent.change(await screen.findByLabelText(/título \*/i), { target: { value: 'Ação civil' } });
    fireEvent.change(screen.getByLabelText(/área \*/i), { target: { value: 'Direito Civil' } });
    fireEvent.change(screen.getByPlaceholderText(/digite o nome do cliente/i), { target: { value: 'Empresa Teste' } });
    fireEvent.click(screen.getByText(/empresa teste/i));
    fireEvent.change(screen.getByLabelText(/prazo \*/i), { target: { value: '2030-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Prazo inválido');
    expect(screen.getByRole('heading', { name: /novo processo/i })).toBeInTheDocument();
  });

  it('keeps the Landing header logo and does not render the removed copyright footer or Premium card', () => {
    const { rerender } = render(<MemoryRouter><Landing isAuthenticated={false} /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /lexflow início/i })).toBeInTheDocument();
    expect(screen.queryByText(/© 2026 lexflow/i)).not.toBeInTheDocument();

    rerender(<MemoryRouter><Sidebar activeSection="dashboard" onSectionChange={jest.fn()} /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
    expect(screen.queryByText('Suporte 24/7')).not.toBeInTheDocument();
  });
});
