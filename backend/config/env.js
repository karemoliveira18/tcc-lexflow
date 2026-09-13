import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "CORS_ALLOWED_ORIGINS"];

const parseCorsOrigins = () => {
  const rawOrigins = process.env.CORS_ALLOWED_ORIGINS;

  if (!rawOrigins || typeof rawOrigins !== "string" || rawOrigins.trim() === "") {
    throw new Error("CORS_ALLOWED_ORIGINS is required and must contain comma-separated origins.");
  }

  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CORS_ALLOWED_ORIGINS is required and must contain comma-separated origins.");
  }

  return origins;
};

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const corsOrigins = parseCorsOrigins();

  return {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ALLOWED_ORIGINS: corsOrigins,
  };
};

export { validateEnvironment, parseCorsOrigins };
