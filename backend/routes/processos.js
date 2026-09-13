import express from "express";
import {
  getAllProcessos,
  getProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso,
} from "../controllers/processoController.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { processoSchema, idParamSchema, listProcessosQuerySchema } from "../utils/validation.js";

const router = express.Router();

router.get("/", validateQuery(listProcessosQuerySchema), getAllProcessos);
router.get("/:id", validateParams(idParamSchema), getProcessoById);
router.post("/", validateBody(processoSchema), createProcesso);
router.patch("/:id", validateParams(idParamSchema), validateBody(processoSchema.partial()), updateProcesso);
router.put("/:id", validateParams(idParamSchema), validateBody(processoSchema.partial()), updateProcesso);
router.delete("/:id", validateParams(idParamSchema), deleteProcesso);

export default router;
