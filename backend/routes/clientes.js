import express from "express";
import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../controllers/clienteController.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { clienteSchema, idParamSchema, listClientesQuerySchema } from "../utils/validation.js";

const router = express.Router();

router.get("/", validateQuery(listClientesQuerySchema), getAllClientes);
router.get("/:id", validateParams(idParamSchema), getClienteById);
router.post("/", validateBody(clienteSchema), createCliente);
router.patch("/:id", validateParams(idParamSchema), validateBody(clienteSchema.partial()), updateCliente);
router.put("/:id", validateParams(idParamSchema), validateBody(clienteSchema.partial()), updateCliente);
router.delete("/:id", validateParams(idParamSchema), deleteCliente);

export default router;
