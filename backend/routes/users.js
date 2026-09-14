import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/authorization.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  listUsersQuerySchema,
} from "../utils/validation.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get("/", validateQuery(listUsersQuerySchema), getAllUsers);
router.get("/:id", validateParams(idParamSchema), getUserById);
router.post("/", validateBody(createUserSchema), createUser);
router.patch("/:id", validateParams(idParamSchema), validateBody(updateUserSchema), updateUser);
router.put("/:id", validateParams(idParamSchema), validateBody(updateUserSchema), updateUser);
router.patch("/:id/status", validateParams(idParamSchema), toggleUserStatus);

export default router;
