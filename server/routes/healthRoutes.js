const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');
const { videoQueue, imageQueue, captureQueue } = require('../config/queue');

const getQueueHealth = async (queue, name) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);
    return { status: 'ready', waiting, active, completed, failed };
  } catch {
    return { status: 'unavailable' };
  }
};

// GET /health — full health check
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    services: {},
    version: '1.0.0',
  };

  // Database
  const dbState = mongoose.connection.readyState;
  health.services.database = {
    status: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
    readyState: dbState,
  };

  // Redis
  try {
    const redis = getRedisClient();
    if (redis && redis.isReady) {
      await redis.ping();
      health.services.redis = { status: 'connected' };
    } else {
      health.services.redis = { status: 'disconnected' };
    }
  } catch {
    health.services.redis = { status: 'unavailable' };
  }

  // Queues
  const [videoHealth, imageHealth, captureHealth] = await Promise.all([
    getQueueHealth(videoQueue, 'video'),
    getQueueHealth(imageQueue, 'image'),
    getQueueHealth(captureQueue, 'capture'),
  ]);

  health.services.queues = {
    video: videoHealth,
    image: imageHealth,
    capture: captureHealth,
  };

  // Memory usage
  const mem = process.memoryUsage();
  health.memory = {
    heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
  };

  health.responseTime = `${Date.now() - startTime}ms`;

  // Set status to degraded if any critical service is down
  const dbOk = health.services.database.status === 'connected';
  const redisOk = health.services.redis.status === 'connected';

  if (!dbOk) health.status = 'critical';
  else if (!redisOk) health.status = 'degraded';

  const statusCode = health.status === 'critical' ? 503 : 200;
  res.status(statusCode).json(health);
});

// GET /health/ping — lightweight liveness probe
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /health/ready — readiness probe (for Railway/k8s)
router.get('/ready', async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) return res.status(503).json({ status: 'not ready', reason: 'database not connected' });
  res.json({ status: 'ready' });
});

module.exports = router;
