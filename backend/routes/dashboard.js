import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getDashboardMetrics } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard/metrics - Get dashboard metrics
router.get("/metrics", authenticateToken, getDashboardMetrics);

export default router;
