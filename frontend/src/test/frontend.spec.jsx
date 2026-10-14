import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Dashboard from '../pages/Dashboard';
import Processos from '../pages/Processos';
import Clientes from '../pages/Clientes';
import ProcessosTable from '../components/ProcessosTable';
import Sidebar from '../components/Sidebar';
import Landing from '../pages/Landing';
import { dashboardAPI, clientesAPI, processosAPI } from '../api';
import { MemoryRouter } from 'react-router-dom';

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

    const { container } = render(<Dashboard />);

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

  it('opens, fills and submits the client form successfully', async () => {
    clientesAPI.getAllClientes.mockResolvedValue({ data: { data: [] } });
    clientesAPI.createCliente.mockResolvedValue({ data: { success: true } });

    render(<Clientes />);

    fireEvent.click(screen.getByRole('button', { name: /novo cliente/i }));

    fireEvent.change(screen.getByLabelText(/nome \*/i), {
      target: { name: 'nome', value: 'Maria Silva' },
    });
    fireEvent.change(screen.getByLabelText(/cpf\/cnpj \*/i), {
      target: { name: 'cpfCnpj', value: '12345678900' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: 'email', value: 'maria@email.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(clientesAPI.createCliente).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Maria Silva', cpfCnpj: '12345678900', email: 'maria@email.com' }),
      );
    });

    expect(screen.queryByRole('heading', { name: /novo cliente/i })).not.toBeInTheDocument();
    expect(await screen.findByText(/cliente cadastrado com sucesso/i)).toBeInTheDocument();
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
      response: { data: { error: { code: 'VALIDATION_ERROR', message: 'CPF/CNPJ inválido' } } },
    });

    render(<Clientes />);
    fireEvent.click(screen.getByRole('button', { name: /novo cliente/i }));
    fireEvent.change(screen.getByLabelText(/nome \*/i), { target: { value: 'Maria Silva' } });
    fireEvent.change(screen.getByLabelText(/cpf\/cnpj \*/i), { target: { value: '12345678900' } });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('CPF/CNPJ inválido');
    expect(screen.getByRole('heading', { name: /novo cliente/i })).toBeInTheDocument();
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
