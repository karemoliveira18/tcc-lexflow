const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDashboardMetrics } = require('../controllers/dashboardController');

const router = express.Router();

// GET /api/dashboard/metrics - Get dashboard metrics
router.get('/metrics', authenticateToken, getDashboardMetrics);

module.exports = router;
