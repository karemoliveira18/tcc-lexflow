import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

console.log("Prisma carregado com sucesso");
