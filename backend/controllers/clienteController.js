import { prisma } from "../db.js";

const getAllClientes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const clientes = await prisma.cliente.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const cliente = await prisma.cliente.findFirst({
      where: { id, userId },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const userId = req.user.userId;

    // Validação
    if (!nome || !cpfCnpj) {
      return res
        .status(400)
        .json({ error: "Nome e CPF/CNPJ são obrigatórios" });
    }

    // Verificar se CPF/CNPJ já existe
    const clienteExists = await prisma.cliente.findUnique({
      where: { cpfCnpj },
    });

    if (clienteExists) {
      return res.status(409).json({ error: "CPF/CNPJ já registrado" });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpfCnpj,
        email,
        telefone,
        endereco,
        cidade,
        estado,
        cep,
        observacoes,
        userId,
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
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

    // Verificar se cliente existe e pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id, userId },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const clienteUpdated = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome || undefined,
        cpfCnpj: cpfCnpj || undefined,
        email: email || undefined,
        telefone: telefone || undefined,
        endereco: endereco || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        cep: cep || undefined,
        observacoes: observacoes || undefined,
        ativo: ativo !== undefined ? ativo : undefined,
      },
    });

    res.json(clienteUpdated);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "CPF/CNPJ já está registrado" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar se cliente existe e pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id, userId },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    await prisma.cliente.delete({
      where: { id },
    });

    res.json({ message: "Cliente excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
