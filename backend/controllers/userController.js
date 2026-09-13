import { prisma } from "../db.js";
import { hashPassword } from "../services/authService.js";
import { sendError } from "../utils/http.js";

const getAllUsers = async (req, res) => {
  try {
    const { search, perfil, ativo, page = 1, limit = 20 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const searchTerm = typeof search === "string" ? search.trim() : "";
    const activeFilter = ativo === undefined ? undefined : ativo === "true";

    const where = {
      ...(searchTerm
        ? {
            OR: [
              { nome: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(perfil ? { perfil } : {}),
      ...(activeFilter !== undefined ? { ativo: activeFilter } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      data: users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
    });

    if (!user) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
        details: [],
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get user by id error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, nome, perfil } = req.body;

    if (!email || !password || !nome) {
      return sendError(res, {
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Email, senha e nome são obrigatórios",
        details: [],
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, {
        status: 409,
        code: "CONFLICT",
        message: "Email já registrado",
        details: [],
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nome, perfil: perfil || "usuario" },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, nome, perfil, ativo } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
        details: [],
      });
    }

    const isSelfUpdate = req.user && req.user.userId === id;
    const isAdmin = req.user && req.user.perfil === "admin";

    if (isSelfUpdate && ativo === false) {
      return sendError(res, {
        status: 403,
        code: "FORBIDDEN",
        message: "Você não pode desativar sua própria conta no momento",
        details: [],
      });
    }

    if (ativo === true && !isAdmin) {
      return sendError(res, {
        status: 403,
        code: "FORBIDDEN",
        message: "Apenas administradores podem reativar usuários",
        details: [],
      });
    }

    const data = {
      email: email ?? undefined,
      nome: nome ?? undefined,
      perfil: perfil ?? undefined,
      ativo: ativo !== undefined ? ativo : undefined,
    };

    if (password) {
      data.password = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return sendError(res, {
        status: 404,
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
        details: [],
      });
    }

    if (!user.ativo) {
      return res.json({ message: "Usuário já inativo" });
    }

    await prisma.user.update({
      where: { id },
      data: { ativo: false },
    });

    return res.json({ message: "Usuário desativado com sucesso" });
  } catch (error) {
    console.error("Delete user error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
