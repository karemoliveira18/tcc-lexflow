const { prisma } = require('../db');
const { hashPassword } = require('../services/authService');

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const user = await prisma.user.create({
    data: {
      email: 'advogado@lexflow.com',
      password: await hashPassword('123456'),
      nome: 'Dr. Silva',
      perfil: 'advogado',
      ativo: true
    }
  });

  console.log(`✅ Usuário criado: ${user.email}`);

  // Criar clientes de teste
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'João Silva Empresa LTDA',
      cpfCnpj: '12.345.678/0001-90',
      email: 'joao@empresa.com.br',
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      observacoes: 'Cliente importante',
      userId: user.id
    }
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Maria Santos',
      cpfCnpj: '123.456.789-00',
      email: 'maria@email.com',
      telefone: '(11) 99999-8888',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      userId: user.id
    }
  });

  console.log(`✅ Clientes criados: ${cliente1.nome}, ${cliente2.nome}`);

  // Criar processos de teste
  const processo1 = await prisma.processo.create({
    data: {
      titulo: 'Processo Cível - Cobrança',
      area: 'Direito Civil',
      prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      status: 'ativo',
      descricao: 'Ação de cobrança de débito',
      prioridade: 'alta',
      userId: user.id,
      clienteId: cliente1.id
    }
  });

  const processo2 = await prisma.processo.create({
    data: {
      titulo: 'Consultoria Trabalhista',
      area: 'Direito Trabalhista',
      prazo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      status: 'ativo',
      descricao: 'Análise de contrato de trabalho',
      prioridade: 'normal',
      userId: user.id,
      clienteId: cliente2.id
    }
  });

  const processo3 = await prisma.processo.create({
    data: {
      titulo: 'Ação de Divórcio',
      area: 'Direito de Família',
      prazo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      status: 'aguardando',
      descricao: 'Processo de dissolução de casamento',
      prioridade: 'normal',
      userId: user.id,
      clienteId: cliente1.id
    }
  });

  console.log(`✅ Processos criados: ${processo1.titulo}, ${processo2.titulo}, ${processo3.titulo}`);

  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
