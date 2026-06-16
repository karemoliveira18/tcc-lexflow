import { PrismaClient } from "@prisma/client";

// Inicializa o cliente Prisma
// Corrigido: havia um texto residual ("npm run dev") na declaração que causava erro.
const prisma = new PrismaClient();
async function initializeDatabase() {
  try {
    // Create the database and tables if they don't exist
    await prisma.$connect();
    console.log("Database connected successfully");

    // Prisma will automatically create tables based on schema
    // No need for manual table creation with Prisma
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
}

export { prisma, initializeDatabase };
