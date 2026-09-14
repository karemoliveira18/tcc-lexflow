import { prisma } from "../db.js";
import { sendError } from "../utils/http.js";
import { serializeDateOnly } from "../utils/date.js";

const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limiteSuperior = new Date(hoje);
    limiteSuperior.setDate(limiteSuperior.getDate() + 8);

    const baseWhere = { userId };
    const processosNaoConcluidosWhere = {
      ...baseWhere,
      status: { not: "concluído" },
    };
    const proximosVencimentosWhere = {
      ...processosNaoConcluidosWhere,
      prazo: {
        gte: hoje,
        lt: limiteSuperior,
      },
    };
    const processosVencidosWhere = {
      ...processosNaoConcluidosWhere,
      prazo: {
        lt: hoje,
      },
    };

    const [
      totalProcessos,
      processosPorStatus,
      processosPorPrioridade,
      processosPorArea,
      totalClientes,
      processosNaoConcluidos,
      processosConcluidos,
      processosVencidos,
      proximosVencimentosCount,
      proximosVencimentos,
    ] = await Promise.all([
      prisma.processo.count({ where: baseWhere }),
      prisma.processo.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: true,
      }),
      prisma.processo.groupBy({
        by: ["prioridade"],
        where: baseWhere,
        _count: true,
      }),
      prisma.processo.groupBy({
        by: ["area"],
        where: baseWhere,
        _count: true,
      }),
      prisma.cliente.count({
        where: { ...baseWhere, ativo: true },
      }),
      prisma.processo.count({
        where: processosNaoConcluidosWhere,
      }),
      prisma.processo.count({
        where: { ...baseWhere, status: "concluído" },
      }),
      prisma.processo.count({
        where: processosVencidosWhere,
      }),
      prisma.processo.count({
        where: proximosVencimentosWhere,
      }),
      prisma.processo.findMany({
        where: proximosVencimentosWhere,
        orderBy: { prazo: "asc" },
        take: 6,
        include: {
          cliente: true,
        },
      }),
    ]);

    return res.json({
      resumo: {
        totalProcessos,
        totalClientes,
        processosVencidos,
        processosAtivos: processosNaoConcluidos,
        processosNaoConcluidos,
        processosConcluidos,
        proximosVencimentosCount,
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
        prazo: serializeDateOnly(processo.prazo),
        cliente: processo.cliente?.nome || "Sem cliente",
        prioridade: processo.prioridade,
      })),
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

export { getDashboardMetrics };
