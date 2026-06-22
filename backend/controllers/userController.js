import { prisma } from "../db.js";
import { hashPassword } from "../services/authService.js";

// Controller mínimo para usuários (AV2): lista, cria, atualiza, remove.
// Usa Prisma para operações: findMany, create, update, delete.

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, nome, perfil } = req.body;
    if (!email || !password || !nome) {
      return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email já registrado" });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, nome, perfil: perfil || "usuario" },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, nome, perfil, ativo } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const data = {
      email: email || undefined,
      nome: nome || undefined,
      perfil: perfil || undefined,
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

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
