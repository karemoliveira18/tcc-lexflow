import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Senha123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@lexflow.com" },
    update: {
      nome: "Administrador LexFlow",
      password: passwordHash,
      perfil: "advogado",
      ativo: true,
    },
    create: {
      email: "admin@lexflow.com",
      password: passwordHash,
      nome: "Administrador LexFlow",
      perfil: "advogado",
      ativo: true,
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { cpfCnpj: "00000000000" },
    update: {
      nome: "Cliente Exemplo",
      email: "cliente@lexflow.com",
      telefone: "(11) 90000-0000",
      endereco: "Rua Exemplo, 100",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01000-000",
      observacoes: "Cliente inicial para testes",
      userId: user.id,
    },
    create: {
      nome: "Cliente Exemplo",
      cpfCnpj: "00000000000",
      email: "cliente@lexflow.com",
      telefone: "(11) 90000-0000",
      endereco: "Rua Exemplo, 100",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01000-000",
      observacoes: "Cliente inicial para testes",
      userId: user.id,
    },
  });

  await prisma.processo.upsert({
    where: { id: "seed-processo-1" },
    update: {
      titulo: "Processo Exemplo",
      area: "Direito Civil",
      prazo: new Date(new Date().setDate(new Date().getDate() + 15)),
      status: "ativo",
      prioridade: "normal",
      descricao: "Processo inicial de demonstração",
      userId: user.id,
      clienteId: cliente.id,
    },
    create: {
      id: "seed-processo-1",
      titulo: "Processo Exemplo",
      area: "Direito Civil",
      prazo: new Date(new Date().setDate(new Date().getDate() + 15)),
      status: "ativo",
      prioridade: "normal",
      descricao: "Processo inicial de demonstração",
      userId: user.id,
      clienteId: cliente.id,
    },
  });

  console.log("Seed concluído com sucesso");
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
