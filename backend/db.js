import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
}

export { prisma, initializeDatabase };
