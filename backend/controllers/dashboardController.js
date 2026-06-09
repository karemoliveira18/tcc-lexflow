import { prisma } from "../db.js";

const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total de processos
    const totalProcessos = await prisma.processo.count({
      where: { userId },
    });

    // Processos por status
    const processosPorStatus = await prisma.processo.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    // Processos por prioridade
    const processosPorPrioridade = await prisma.processo.groupBy({
      by: ["prioridade"],
      where: { userId },
      _count: true,
    });

    // Processos por área
    const processosPorArea = await prisma.processo.groupBy({
      by: ["area"],
      where: { userId },
      _count: true,
    });

    // Total de clientes
    const totalClientes = await prisma.cliente.count({
      where: { userId, ativo: true },
    });

    // Contagens de status principais
    const processosAtivos = await prisma.processo.count({
      where: {
        userId,
        status: { not: "concluído" },
      },
    });

    const processosConcluidos = await prisma.processo.count({
      where: {
        userId,
        status: "concluído",
      },
    });

    // Processos vencidos e próximos do vencimento
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seteDias = new Date(hoje);
    seteDias.setDate(seteDias.getDate() + 7);

    const processosVencidos = await prisma.processo.count({
      where: {
        userId,
        prazo: {
          lt: hoje,
        },
        status: { not: "concluído" },
      },
    });

    const proximosVencimentos = await prisma.processo.findMany({
      where: {
        userId,
        prazo: {
          gte: hoje,
          lte: seteDias,
        },
        status: { not: "concluído" },
      },
      orderBy: {
        prazo: "asc",
      },
      take: 6,
      include: {
        cliente: true,
      },
    });

    res.json({
      resumo: {
        totalProcessos,
        totalClientes,
        processosVencidos,
        processosAtivos,
        processosConcluidos,
        proximosVencimentosCount: proximosVencimentos.length,
      },
      processosPorStatus: processosPorStatus.map((item) => ({
        status: item.status,
        quantidade: item._count,
      })),
      processosPorPrioridade: processosPorPrioridade.map((item) => ({
        prioridade: item.prioridade,
        quantidade: item._count,
      })),
      processosPorArea: processosPorArea.map((item) => ({
        area: item.area,
        quantidade: item._count,
      })),
      proximosVencimentos: proximosVencimentos.map((processo) => ({
        id: processo.id,
        titulo: processo.titulo,
        prazo: processo.prazo,
        cliente: processo.cliente?.nome || "Sem cliente",
        prioridade: processo.prioridade,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getDashboardMetrics };
