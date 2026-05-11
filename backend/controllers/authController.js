const { prisma } = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password, nome, perfil } = req.body;

    // Validação básica
    if (!email || !password || !nome) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    // Verificar se usuário já existe
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(409).json({ error: 'Email já registrado' });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nome,
        perfil: perfil || 'usuario'
      }
    });

    // Gerar token
    const token = generateToken(user.id, user.email, user.perfil);

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Validar senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = generateToken(user.id, user.email, user.perfil);

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getProfile };
