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

    // Total de clientes
    const totalClientes = await prisma.cliente.count({
      where: { userId, ativo: true },
    });

    // Processos por prioridade
    const processosPorPrioridade = await prisma.processo.groupBy({
      by: ["prioridade"],
      where: { userId },
      _count: true,
    });

    // Processos vencidos (prazo menor que hoje)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const processosVencidos = await prisma.processo.count({
      where: {
        userId,
        prazo: {
          lt: hoje,
        },
        status: { not: "concluído" },
      },
    });

    // Processos por área
    const processosPorArea = await prisma.processo.groupBy({
      by: ["area"],
      where: { userId },
      _count: true,
    });

    res.json({
      resumo: {
        totalProcessos,
        totalClientes,
        processosVencidos,
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
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getDashboardMetrics };
