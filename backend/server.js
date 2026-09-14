import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import { validateEnvironment, parseCorsOrigins } from "./config/env.js";
import { initializeDatabase, prisma } from "./db.js";
import { authenticateToken } from "./middleware/auth.js";
import { sendError } from "./utils/http.js";
import authRoutes from "./routes/auth.js";
import processosRoutes from "./routes/processos.js";
import clientesRoutes from "./routes/clientes.js";
import dashboardRoutes from "./routes/dashboard.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const env = validateEnvironment();
const app = express();
const allowedOrigins = parseCorsOrigins();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "LexFlow API is running" });
});

app.use("/api/processos", authenticateToken, processosRoutes);
app.use("/api/clientes", authenticateToken, clientesRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/users", authenticateToken, usersRoutes);

if (existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

const PORT = Number(process.env.PORT || 5000);

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return sendError(res, {
      status: 404,
      code: "NOT_FOUND",
      message: "Recurso não encontrado",
      details: [],
    });
  }

  if (existsSync(frontendDistPath)) {
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  }

  return sendError(res, {
    status: 404,
    code: "NOT_FOUND",
    message: "Recurso não encontrado",
    details: [],
  });
});

app.use((error, req, res, next) => {
  console.error("Unexpected server error:", error);

  if (error && error.message === "Not allowed by CORS") {
    return sendError(res, {
      status: 403,
      code: "FORBIDDEN",
      message: "Origin not allowed by CORS",
      details: [],
    });
  }

  if (error && error.code === "VALIDATION_ERROR") {
    return sendError(res, {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Dados inválidos",
      details: error.details || [],
    });
  }

  return sendError(res, {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
    details: [],
  });
});

const startServer = async () => {
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    console.log(`🚀 LexFlow API running on port ${PORT}`);
    console.log(`📊 Database: ${env.DATABASE_URL.includes("mysql") ? "MySQL" : "configured backend"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      console.log("HTTP server closed. Waiting for active requests to finish...");
      await prisma.$disconnect();
      console.log("Prisma disconnected");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  return server;
};

export { app, startServer };

if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
