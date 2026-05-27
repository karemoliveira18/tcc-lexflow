import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllProcessos,
  getProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso,
} from "../controllers/processoController.js";

const router = express.Router();

// Todas as rotas de processo requerem autenticação
router.use(authenticateToken);

// GET /api/processos - List all processes
router.get("/", getAllProcessos);

// GET /api/processos/:id - Get process by ID
router.get("/:id", getProcessoById);

// POST /api/processos - Create new process
router.post("/", createProcesso);

// PUT /api/processos/:id - Update process
router.put("/:id", updateProcesso);

// DELETE /api/processos/:id - Delete process
router.delete("/:id", deleteProcesso);

export default router;
