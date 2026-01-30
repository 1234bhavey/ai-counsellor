const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./utils/database');

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/oauth')); // OAuth routes
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/counsellor', require('./routes/counsellor'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/profile', require('./routes/profile'));
// Removed admin routes - USER ONLY SYSTEM

// Enhanced health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const { pool } = require('./utils/database');
    await pool.query('SELECT NOW()');
    
    res.json({ 
      status: 'OK', 
      message: `${process.env.APP_NAME || 'AI Counsellor API'} is running`,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔄 Initializing database...');
    await initDB();
    console.log('✅ Database initialized successfully');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🎉 ================================');
      console.log(`🚀 AI Counsellor Backend Started!`);
      console.log('🎉 ================================');
      console.log(`📍 Local:    http://localhost:${PORT}`);
      console.log(`📍 Network:  http://127.0.0.1:${PORT}`);
      console.log(`🔗 Health:   http://localhost:${PORT}/api/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS: Enabled for frontend`);
      console.log('🎉 ================================');
      console.log('');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log('');
        console.log('🔧 Quick Fix:');
        console.log('1. Run: taskkill /f /im node.exe');
        console.log('2. Or change PORT in .env file');
        console.log('3. Or run: start-backend.bat');
        console.log('');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();