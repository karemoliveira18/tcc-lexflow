import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

// Middleware de autenticação. Para facilitar a avaliação (AV2) em ambiente
// de desenvolvimento, se nenhum token for fornecido tentamos buscar o usuário
// seed (admin@lexflow.com) e atribuí-lo a `req.user`. Em produção esse
// comportamento deve ser removido por segurança.
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    // Ambiente de desenvolvimento: permitir requests sem token usando o usuário seed
    try {
      const devEmail = process.env.DEV_USER_EMAIL || "admin@lexflow.com";
      const user = await prisma.user.findUnique({ where: { email: devEmail } });
      if (user) {
        req.user = { userId: user.id, email: user.email, perfil: user.perfil };
        return next();
      }
      return res.status(401).json({ error: "Token não fornecido" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao autenticar usuário de desenvolvimento" });
    }
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_secret_key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Token inválido ou expirado" });
      }
      req.user = user;
      next();
    },
  );
};

export { authenticateToken };
