const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const processosRoutes = require('./routes/processos');
const clientesRoutes = require('./routes/clientes');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/processos', processosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LexFlow API is running' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 LexFlow API running on port ${PORT}`);
    console.log(`📊 Database: SQLite`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);