import { prisma } from "../db.js";
import { sendError } from "../utils/http.js";
import { parseDateOnly, serializeDateOnly } from "../utils/date.js";

const getAllProcessos = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { search, status, prioridade, area, clienteId, prazoDe, prazoAte, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const searchTerm = typeof search === "string" ? search.trim() : "";
    const areaFilter = typeof area === "string" ? area.trim() : "";
    const prazoFilter = {};

    if (prazoDe) {
      const parsedPrazoDe = parseDateOnly(prazoDe);
      if (parsedPrazoDe) prazoFilter.gte = parsedPrazoDe;
    }
    if (prazoAte) {
      const parsedPrazoAte = parseDateOnly(prazoAte);
      if (parsedPrazoAte) prazoFilter.lte = parsedPrazoAte;
    }

    const where = {
      userId,
      ...(searchTerm ? { titulo: { contains: searchTerm } } : {}),
      ...(status ? { status } : {}),
      ...(prioridade ? { prioridade } : {}),
      ...(areaFilter ? { area: { contains: areaFilter } } : {}),
      ...(clienteId ? { clienteId } : {}),
      ...(Object.keys(prazoFilter).length ? { prazo: prazoFilter } : {}),
    };

    const [processos, total] = await Promise.all([
      prisma.processo.findMany({
        where,
        include: {
          cliente: {
            select: { id: true, nome: true, cpfCnpj: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      prisma.processo.count({ where }),
    ]);

    return res.json({
      data: processos.map((processo) => ({
        ...processo,
        prazo: serializeDateOnly(processo.prazo),
      })),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get all processos error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const getProcessoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }

    const processo = await prisma.processo.findFirst({
      where: { id, userId },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            cpfCnpj: true,
            email: true,
            telefone: true,
          },
        },
      },
    });

    if (!processo) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Processo não encontrado",
        details: [],
      });
    }

    return res.json({
      ...processo,
      prazo: serializeDateOnly(processo.prazo),
    });
  } catch (error) {
    console.error("Get processo by id error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const createProcesso = async (req, res) => {
  try {
    const { titulo, area, prazo, status, descricao, prioridade, clienteId } =
      req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }

    const parsedPrazo = parseDateOnly(prazo);
    if (!parsedPrazo) {
      return sendError(res, {
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Prazo inválido. Use o formato YYYY-MM-DD",
        details: [],
      });
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, userId },
    });

    if (!cliente) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Cliente não encontrado",
        details: [],
      });
    }

    if (!cliente.ativo) {
      return sendError(res, {
        status: 409,
        code: "CONFLICT",
        message: "Não é possível criar processo para cliente inativo",
        details: [],
      });
    }

    const processo = await prisma.processo.create({
      data: {
        titulo,
        area,
        prazo: parsedPrazo,
        status: status || "ativo",
        descricao,
        prioridade: prioridade || "normal",
        userId,
        clienteId,
      },
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true },
        },
      },
    });

    return res.status(201).json({
      ...processo,
      prazo: serializeDateOnly(processo.prazo),
    });
  } catch (error) {
    console.error("Create processo error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const updateProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }
    const { titulo, area, prazo, status, descricao, prioridade, clienteId } = req.body;

    const processo = await prisma.processo.findFirst({
      where: { id, userId },
    });

    if (!processo) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Processo não encontrado",
        details: [],
      });
    }

    if (clienteId !== undefined) {
      const cliente = await prisma.cliente.findFirst({
        where: { id: clienteId, userId },
      });

      if (!cliente) {
        return sendError(res, {
          status: 404,
          code: "NOT_FOUND",
          message: "Cliente não encontrado para este usuário",
          details: [],
        });
      }
    }

    const nextPrazo = prazo !== undefined ? parseDateOnly(prazo) : undefined;
    if (prazo !== undefined && !nextPrazo) {
      return sendError(res, {
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Prazo inválido. Use o formato YYYY-MM-DD",
        details: [],
      });
    }

    const processoUpdated = await prisma.processo.update({
      where: { id },
      data: {
        titulo: titulo !== undefined ? titulo : undefined,
        area: area !== undefined ? area : undefined,
        prazo: nextPrazo ?? undefined,
        status: status !== undefined ? status : undefined,
        descricao: descricao !== undefined ? descricao : undefined,
        prioridade: prioridade !== undefined ? prioridade : undefined,
        clienteId: clienteId !== undefined ? clienteId : undefined,
      },
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true },
        },
      },
    });

    return res.json({
      ...processoUpdated,
      prazo: serializeDateOnly(processoUpdated.prazo),
    });
  } catch (error) {
    console.error("Update processo error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const deleteProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }

    const processo = await prisma.processo.findFirst({
      where: { id, userId },
    });

    if (!processo) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Processo não encontrado",
        details: [],
      });
    }

    await prisma.processo.delete({
      where: { id },
    });

    return res.json({ message: "Processo excluído com sucesso" });
  } catch (error) {
    console.error("Delete processo error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

export {
  getAllProcessos,
  getProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso,
};
