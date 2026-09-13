import { prisma } from "../db.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../services/authService.js";
import { sendError } from "../utils/http.js";

const register = async (req, res) => {
  try {
    const { email, password, nome } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return sendError(res, {
        status: 409,
        code: "CONFLICT",
        message: "Email já registrado",
        details: [],
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nome,
        perfil: "usuario",
      },
    });

    const token = generateToken(user.id, user.email, user.perfil);

    return res.status(201).json({
      message: "Usuário registrado com sucesso",
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Credenciais inválidas",
        details: [],
      });
    }

    if (!user.ativo) {
      return sendError(res, {
        status: 401,
        code: "ACCOUNT_INACTIVE",
        message: "Usuário inativo",
        details: [],
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Credenciais inválidas",
        details: [],
      });
    }

    const token = generateToken(user.id, user.email, user.perfil);

    return res.json({
      message: "Login bem-sucedido",
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        nome: true,
        perfil: true,
        ativo: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Usuário não encontrado",
        details: [],
      });
    }

    if (!user.ativo) {
      return sendError(res, {
        status: 401,
        code: "ACCOUNT_INACTIVE",
        message: "Usuário inativo",
        details: [],
      });
    }

    return res.json({
      ...user,
      perfil: user.perfil,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return sendError(res, {
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
      details: [],
    });
  }
};

export { register, login, getProfile };
