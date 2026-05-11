const { prisma } = require('../db');

const getAllProcessos = async (req, res) => {
  try {
    const userId = req.user.userId;

    const processos = await prisma.processo.findMany({
      where: { userId },
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(processos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProcessoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const processo = await prisma.processo.findFirst({
      where: { id, userId },
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true, email: true, telefone: true }
        }
      }
    });

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    res.json(processo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProcesso = async (req, res) => {
  try {
    const { titulo, area, prazo, status, descricao, prioridade, clienteId } = req.body;
    const userId = req.user.userId;

    // Validações
    if (!titulo || !area || !prazo || !clienteId) {
      return res.status(400).json({ error: 'Título, área, prazo e cliente são obrigatórios' });
    }

    // Verificar se cliente existe e pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, userId }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const processo = await prisma.processo.create({
      data: {
        titulo,
        area,
        prazo: new Date(prazo),
        status: status || 'ativo',
        descricao,
        prioridade: prioridade || 'normal',
        userId,
        clienteId
      },
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true }
        }
      }
    });

    res.status(201).json(processo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { titulo, area, prazo, status, descricao, prioridade } = req.body;

    // Verificar se processo existe e pertence ao usuário
    const processo = await prisma.processo.findFirst({
      where: { id, userId }
    });

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const processoUpdated = await prisma.processo.update({
      where: { id },
      data: {
        titulo: titulo || undefined,
        area: area || undefined,
        prazo: prazo ? new Date(prazo) : undefined,
        status: status || undefined,
        descricao: descricao || undefined,
        prioridade: prioridade || undefined
      },
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true }
        }
      }
    });

    res.json(processoUpdated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar se processo existe e pertence ao usuário
    const processo = await prisma.processo.findFirst({
      where: { id, userId }
    });

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    await prisma.processo.delete({
      where: { id }
    });

    res.json({ message: 'Processo excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProcessos,
  getProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso
};
