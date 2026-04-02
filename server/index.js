require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Ensure required directories exist
const dirs = ['../logs', './uploads/temp', './uploads/output', './uploads/audio', './uploads/subtitles'];
dirs.forEach(d => { const p = path.join(__dirname, d); if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); });

const { initSentry, sentryRequestHandler, sentryErrorHandler } = require('./middleware/sentry');
const { logger, requestLogger } = require('./middleware/logger');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const contentRoutes = require('./routes/contentRoutes');
const automationRoutes = require('./routes/automationRoutes');
const walletRoutes = require('./routes/walletRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const healthRoutes = require('./routes/healthRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

initSentry();

const app = express();
const PORT = process.env.PORT || 5000;

// Sentry must be first
app.set("trust proxy", 1);
app.use(sentryRequestHandler());

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Session
app.use(session({
  secret: process.env.JWT_SECRET || 'clickzoom-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 1000 },
}));

app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
app.use('/api', apiLimiter);

// Health checks (no auth)
app.use('/health', healthRoutes);

// File downloads (authenticated, served locally)
app.use('/downloads', downloadRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/automate', automationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/language', voiceRoutes);

// Sentry error handler before other error handlers
app.use(sentryErrorHandler());
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    logger.info('Database connected');
    try {
      await connectRedis();
      logger.info('Redis connected');
    } catch (redisErr) {
      logger.warn('Redis unavailable — queues may not work', { error: redisErr.message });
    }
    app.listen(PORT, () => {
      logger.info('ClickZoom API running', { port: PORT, env: process.env.NODE_ENV });
      console.log(`\n🚀 ClickZoom API    → http://localhost:${PORT}`);
      console.log(`   Health check     → http://localhost:${PORT}/health`);
      console.log(`   File downloads   → http://localhost:${PORT}/downloads/`);
      console.log(`   Environment      → ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => { logger.info('Shutting down gracefully'); process.exit(0); });
process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason: String(reason) }));
process.on('uncaughtException', (err) => { logger.error('Uncaught exception', { error: err.message }); process.exit(1); });

start();
module.exports = app;
