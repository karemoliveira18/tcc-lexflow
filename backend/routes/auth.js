import express from "express";
import { login, register, getProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../utils/validation.js";

const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/profile", authenticateToken, getProfile);

export default router;
