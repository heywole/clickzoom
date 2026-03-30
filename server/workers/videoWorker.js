const { videoQueue } = require('../config/queue');
const Tutorial = require('../models/Tutorial');
const TutorialStep = require('../models/TutorialStep');
const GeneratedContent = require('../models/GeneratedContent');
const { generateTutorialVideo } = require('../services/video/ffmpegService');
const { generateFullVoiceover } = require('../services/voice/coquiService');
const { generateFromSteps } = require('../services/voice/whisperService');
const { saveLocalFile, scheduleDelete } = require('../config/storage');
const { sendContentReadyEmail } = require('../utils/email');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

videoQueue.process('generate-video', 2, async (job) => {
  const { tutorialId, userId, outputType } = job.data;
  console.log(`[VideoWorker] Starting job ${job.id} for tutorial ${tutorialId}`);

  let tutorial;
  try {
    tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) throw new Error('Tutorial not found');

    const steps = await TutorialStep.find({ tutorialId }).sort({ stepNumber: 1 });
    if (!steps.length) throw new Error('No steps found for this tutorial');

    await job.progress(10);

    // Generate voiceover for each step
    const voicePaths = await generateFullVoiceover(steps, tutorial.voiceSettings, tutorialId);
    await job.progress(30);

    // Generate subtitles
    const srtPath = await generateFromSteps(steps, tutorialId);
    await job.progress(40);

    // Generate video with zoom effects
    const videoPath = await generateTutorialVideo(steps, tutorial.voiceSettings, {
      resolution: '1080p',
      format: 'mp4',
      tutorialId,
    });
    await job.progress(70);

    // Save locally and get download URL
    const { key: videoKey, url: videoUrl } = await saveLocalFile(videoPath, 'videos');
    const { key: srtKey, url: srtUrl } = await saveLocalFile(srtPath, 'subtitles');
    await job.progress(88);

    // Schedule cleanup after 24 hours
    scheduleDelete(videoKey, 24 * 60 * 60 * 1000);
    scheduleDelete(srtKey, 24 * 60 * 60 * 1000);

    // Save to GeneratedContent
    const existing = await GeneratedContent.findOne({ tutorialId });
    const contentData = {
      tutorialId,
      contentType: 'video',
      fileUrls: [videoUrl],
      fileKeys: [videoKey, srtKey],
      processingStatus: 'completed',
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      qualitySettings: { resolution: '1080p', format: 'mp4' },
    };

    if (existing) {
      await GeneratedContent.findByIdAndUpdate(existing._id, contentData);
    } else {
      await GeneratedContent.create(contentData);
    }

    // Update tutorial status and lock free tier
    tutorial.status = 'completed';
    const user = await User.findById(userId);
    if (user?.subscriptionTier === 'free') {
      tutorial.isLocked = true;
      tutorial.lockedOutputType = outputType === 'both' ? 'video' : outputType;
    }
    await tutorial.save();

    // Notify user by email
    if (user?.email) {
      await sendContentReadyEmail(user.email, tutorial.title).catch(() => {});
    }

    // Cleanup temp files
    await Promise.all([
      fs.unlink(videoPath).catch(() => {}),
      fs.unlink(srtPath).catch(() => {}),
      ...voicePaths.map(p => fs.unlink(p).catch(() => {})),
    ]);

    await job.progress(100);
    console.log(`[VideoWorker] Job ${job.id} completed for tutorial ${tutorialId}`);
    return { status: 'completed', videoUrl };

  } catch (err) {
    console.error(`[VideoWorker] Job ${job.id} failed:`, err.message);
    if (tutorial) {
      tutorial.status = 'failed';
      await tutorial.save().catch(() => {});
    }
    throw err;
  }
});

videoQueue.on('failed', (job, err) => console.error(`[VideoQueue] Job ${job.id} failed: ${err.message}`));
videoQueue.on('completed', (job) => console.log(`[VideoQueue] Job ${job.id} completed`));
console.log('[VideoWorker] Ready');
