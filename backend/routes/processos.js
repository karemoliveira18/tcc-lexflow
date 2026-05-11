const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllProcessos,
  getProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso
} = require('../controllers/processoController');

const router = express.Router();

// Todas as rotas de processo requerem autenticação
router.use(authenticateToken);

// GET /api/processos - List all processes
router.get('/', getAllProcessos);

// GET /api/processos/:id - Get process by ID
router.get('/:id', getProcessoById);

// POST /api/processos - Create new process
router.post('/', createProcesso);

// PUT /api/processos/:id - Update process
router.put('/:id', updateProcesso);

// DELETE /api/processos/:id - Delete process
router.delete('/:id', deleteProcesso);

module.exports = router;