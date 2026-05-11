const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} = require('../controllers/clienteController');

const router = express.Router();

// Todas as rotas de cliente requerem autenticação
router.use(authenticateToken);

// GET /api/clientes - List all clients
router.get('/', getAllClientes);

// GET /api/clientes/:id - Get client by ID
router.get('/:id', getClienteById);

// POST /api/clientes - Create new client
router.post('/', createCliente);

// PUT /api/clientes/:id - Update client
router.put('/:id', updateCliente);

// DELETE /api/clientes/:id - Delete client
router.delete('/:id', deleteCliente);

module.exports = router;
