import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

const parseCorsOrigins = () => {
  const rawOrigins = process.env.FRONTEND_URL || process.env.CORS_ALLOWED_ORIGINS;

  if (!rawOrigins || typeof rawOrigins !== "string" || rawOrigins.trim() === "") {
    throw new Error("FRONTEND_URL (or CORS_ALLOWED_ORIGINS) is required.");
  }

  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("FRONTEND_URL (or CORS_ALLOWED_ORIGINS) is required.");
  }

  return origins.map((origin) => {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error('Invalid frontend origin.');
    }
    if (process.env.NODE_ENV === 'production' && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
      throw new Error('Production frontend origin must use public HTTPS.');
    }
    // Origin headers never contain the frontend subdirectory.
    return url.origin;
  });
};

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const corsOrigins = parseCorsOrigins();
  if (!process.env.DATABASE_URL.startsWith('mysql://')) {
    throw new Error('DATABASE_URL must use mysql:// with this Prisma schema.');
  }
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET.length < 32 || /troque|change|example/i.test(process.env.JWT_SECRET))) {
    throw new Error('Set a unique random JWT_SECRET of at least 32 characters.');
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ALLOWED_ORIGINS: corsOrigins,
  };
};

export { validateEnvironment, parseCorsOrigins };
