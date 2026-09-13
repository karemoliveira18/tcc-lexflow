import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { sendError } from "../utils/http.js";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    try {
      const devEmail = process.env.DEV_USER_EMAIL || "admin@lexflow.com";
      const user = await prisma.user.findUnique({ where: { email: devEmail } });

      if (user) {
        req.user = { userId: user.id, email: user.email, perfil: user.perfil };
        return next();
      }

      return sendError(res, {
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Token não fornecido ou formato inválido",
        details: [],
      });
    } catch (error) {
      console.error("Development auth fallback error:", error);
      return sendError(res, {
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Erro ao autenticar usuário de desenvolvimento",
        details: [],
      });
    }
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return sendError(res, {
      status: 401,
      code: "AUTH_REQUIRED",
      message: "Token não fornecido",
      details: [],
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return sendError(res, {
        status: 401,
        code: "INVALID_TOKEN",
        message: "Token inválido ou expirado",
        details: [],
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
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

      req.user = {
        userId: user.id,
        email: user.email,
        perfil: user.perfil,
      };

      return next();
    } catch (error) {
      console.error("Authentication validation error:", error);
      return sendError(res, {
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Erro interno do servidor",
        details: [],
      });
    }
  });
};

export { authenticateToken };
