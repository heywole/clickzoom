const Bull = require('bull');

const createQueue = (name) => new Bull(name, {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 200 },
});

const videoQueue = createQueue('video-generation');
const imageQueue = createQueue('image-generation');
const captureQueue = createQueue('url-capture');
const voiceQueue = createQueue('voice-generation');

module.exports = { videoQueue, imageQueue, captureQueue, voiceQueue };
