import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, email, perfil) => {
  if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim() === "") {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign(
    { userId, email, perfil },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export { hashPassword, comparePassword, generateToken };
