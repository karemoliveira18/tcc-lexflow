import { prisma } from "../db.js";
import { sendError } from "../utils/http.js";

const getAllClientes = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { search, ativo, page = 1, limit = 20 } = req.query;

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
    const ativoFilter = ativo === undefined ? true : ativo === "true" ? true : ativo === "false" ? false : undefined;

    const where = {
      userId,
      ...(ativoFilter !== undefined ? { ativo: ativoFilter } : {}),
      ...(searchTerm
        ? {
            OR: [
              { nome: { contains: searchTerm, mode: "insensitive" } },
              { cpfCnpj: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      prisma.cliente.count({ where }),
    ]);

    return res.json({
      data: clientes,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get all clientes error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const getClienteById = async (req, res) => {
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

    const cliente = await prisma.cliente.findFirst({
      where: { id, userId },
    });

    if (!cliente) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Cliente não encontrado",
        details: [],
      });
    }

    return res.json(cliente);
  } catch (error) {
    console.error("Get cliente by id error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const createCliente = async (req, res) => {
  try {
    const {
      nome,
      cpfCnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      observacoes,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token de autenticação obrigatório",
        details: [],
      });
    }

    const clienteExists = await prisma.cliente.findUnique({
      where: { cpfCnpj },
    });

    if (clienteExists) {
      return sendError(res, {
        status: 409,
        code: "CONFLICT",
        message: "CPF/CNPJ já registrado",
        details: [],
      });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpfCnpj,
        email: email || null,
        telefone: telefone || null,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        cep: cep || null,
        observacoes: observacoes || null,
        userId,
      },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("Create cliente error:", error);
    if (error?.code === "P2002") {
      return sendError(res, {
        status: 409,
        code: "CONFLICT",
        message: "CPF/CNPJ já está registrado",
        details: [],
      });
    }
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const updateCliente = async (req, res) => {
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
    const {
      nome,
      cpfCnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      observacoes,
      ativo,
    } = req.body;

    const cliente = await prisma.cliente.findFirst({
      where: { id, userId },
    });

    if (!cliente) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Cliente não encontrado",
        details: [],
      });
    }

    if (ativo === true && !cliente.ativo && req.user?.perfil !== "admin") {
      return sendError(res, {
        status: 403,
        code: "FORBIDDEN",
        message: "Apenas o proprietário pode reativar este cliente",
        details: [],
      });
    }

    const clienteUpdated = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome ?? undefined,
        cpfCnpj: cpfCnpj ?? undefined,
        email: email ?? undefined,
        telefone: telefone ?? null,
        endereco: endereco ?? null,
        cidade: cidade ?? null,
        estado: estado ?? null,
        cep: cep ?? null,
        observacoes: observacoes ?? null,
        ativo: ativo !== undefined ? ativo : undefined,
      },
    });

    return res.json(clienteUpdated);
  } catch (error) {
    console.error("Update cliente error:", error);
    if (error?.code === "P2002") {
      return sendError(res, {
        status: 409,
        code: "CONFLICT",
        message: "CPF/CNPJ já está registrado",
        details: [],
      });
    }
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const deleteCliente = async (req, res) => {
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

    const cliente = await prisma.cliente.findFirst({
      where: { id, userId },
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
      return res.json({ message: "Cliente já inativo" });
    }

    await prisma.cliente.update({
      where: { id },
      data: { ativo: false },
    });

    return res.json({ message: "Cliente desativado com sucesso" });
  } catch (error) {
    console.error("Delete cliente error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

export {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
