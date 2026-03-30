const { imageQueue } = require('../config/queue');
const Tutorial = require('../models/Tutorial');
const TutorialStep = require('../models/TutorialStep');
const GeneratedContent = require('../models/GeneratedContent');
const { annotateAllSteps } = require('../services/image/annotationService');
const { saveLocalFile, scheduleDelete } = require('../config/storage');
const { sendContentReadyEmail } = require('../utils/email');
const User = require('../models/User');
const fs = require('fs').promises;

imageQueue.process('generate-images', 2, async (job) => {
  const { tutorialId, userId, outputType } = job.data;
  console.log(`[ImageWorker] Starting job ${job.id} for tutorial ${tutorialId}`);

  let tutorial;
  try {
    tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) throw new Error('Tutorial not found');

    const steps = await TutorialStep.find({ tutorialId }).sort({ stepNumber: 1 });
    if (!steps.length) throw new Error('No steps found');

    await job.progress(10);

    // Annotate all steps
    const annotatedSteps = await annotateAllSteps(steps, tutorialId);
    await job.progress(60);

    // Save all annotated images locally
    const fileUrls = [];
    const fileKeys = [];

    for (const { annotatedPath } of annotatedSteps) {
      try {
        const { key, url } = await saveLocalFile(annotatedPath, 'images');
        fileUrls.push(url);
        fileKeys.push(key);
        scheduleDelete(key, 24 * 60 * 60 * 1000);
        await fs.unlink(annotatedPath).catch(() => {});
      } catch (err) {
        console.warn(`[ImageWorker] Save failed:`, err.message);
      }
    }

    await job.progress(85);

    // Save GeneratedContent
    const existing = await GeneratedContent.findOne({ tutorialId, contentType: 'image_set' });
    const contentData = {
      tutorialId,
      contentType: 'image_set',
      fileUrls,
      fileKeys,
      processingStatus: 'completed',
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      qualitySettings: { format: 'png' },
    };

    if (existing) {
      await GeneratedContent.findByIdAndUpdate(existing._id, contentData);
    } else {
      await GeneratedContent.create(contentData);
    }

    // Update tutorial
    const freshTutorial = await Tutorial.findById(tutorialId);
    if (freshTutorial.status !== 'completed') {
      freshTutorial.status = 'completed';
      const user = await User.findById(userId);
      if (user?.subscriptionTier === 'free') {
        freshTutorial.isLocked = true;
        freshTutorial.lockedOutputType = 'image';
      }
      await freshTutorial.save();
    }

    if (outputType === 'image') {
      const user = await User.findById(userId);
      if (user?.email) await sendContentReadyEmail(user.email, tutorial.title).catch(() => {});
    }

    await job.progress(100);
    console.log(`[ImageWorker] Job ${job.id} completed`);
    return { status: 'completed', imageCount: fileUrls.length };

  } catch (err) {
    console.error(`[ImageWorker] Job ${job.id} failed:`, err.message);
    if (tutorial && tutorial.status !== 'completed') {
      tutorial.status = 'failed';
      await tutorial.save().catch(() => {});
    }
    throw err;
  }
});

imageQueue.on('failed', (job, err) => console.error(`[ImageQueue] Job ${job.id} failed: ${err.message}`));
console.log('[ImageWorker] Ready');
