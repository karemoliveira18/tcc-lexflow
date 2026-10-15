import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../services/authService.js";

const prisma = new PrismaClient();
const allowedEnvironments = new Set([
  "development",
  "test",
  "staging",
  "homologacao",
  "homologation",
]);

const testUsers = [
  {
    email: "lexflow.admin.teste@example.test",
    nome: "Administrador de Teste",
    perfil: "admin",
    passwordVariable: "LEXFLOW_TEST_ADMIN_PASSWORD",
  },
  {
    email: "lexflow.advogado1.teste@example.test",
    nome: "Advogado de Teste 1",
    perfil: "advogado",
    passwordVariable: "LEXFLOW_TEST_LAWYER1_PASSWORD",
  },
  {
    email: "lexflow.advogado2.teste@example.test",
    nome: "Advogado de Teste 2",
    perfil: "advogado",
    passwordVariable: "LEXFLOW_TEST_LAWYER2_PASSWORD",
  },
];

const assertSafeEnvironment = () => {
  if (!allowedEnvironments.has(process.env.NODE_ENV)) {
    throw new Error("Seed de teste permitido somente em desenvolvimento ou homologação.");
  }

  if (process.env.LEXFLOW_ALLOW_TEST_USERS !== "true") {
    throw new Error("Defina LEXFLOW_ALLOW_TEST_USERS=true para habilitar o seed de teste.");
  }
};

const validatePassword = (password, variableName) => {
  if (
    typeof password !== "string"
    || password.length < 20
    || password.length > 191
    || !/[a-z]/.test(password)
    || !/[A-Z]/.test(password)
    || !/\d/.test(password)
    || !/[^A-Za-z\d]/.test(password)
  ) {
    throw new Error(`${variableName} deve ter 20-191 caracteres e conter maiúscula, minúscula, número e símbolo.`);
  }
};

async function main() {
  assertSafeEnvironment();

  for (const account of testUsers) {
    const password = process.env[account.passwordVariable];
    validatePassword(password, account.passwordVariable);
    const passwordHash = await hashPassword(password);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        nome: account.nome,
        password: passwordHash,
        perfil: account.perfil,
        ativo: true,
      },
      create: {
        email: account.email,
        nome: account.nome,
        password: passwordHash,
        perfil: account.perfil,
        ativo: true,
      },
    });

    console.log(`Conta de teste pronta: ${account.email} (${account.perfil})`);
  }
}

main()
  .catch((error) => {
    console.error("Falha no seed de usuários de teste:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
