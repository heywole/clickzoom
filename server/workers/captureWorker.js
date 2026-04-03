const { captureQueue, videoQueue, imageQueue } = require('../config/queue');
const Tutorial = require('../models/Tutorial');
const TutorialStep = require('../models/TutorialStep');
const { captureUrl } = require('../services/automation/puppeteerService');
const { uploadFile } = require('../config/storage');
const fs = require('fs').promises;

captureQueue.process('capture-url', 1, async (job) => {
  const { tutorialId, targetUrl, userId } = job.data;
  console.log(`[CaptureWorker] Starting capture of ${targetUrl} for tutorial ${tutorialId}`);

  try {
    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) throw new Error('Tutorial not found');

    await job.progress(5);

    // Run Puppeteer capture
    const capturedSteps = await captureUrl(targetUrl, tutorialId, async (progress) => {
      await job.progress(Math.min(80, progress));
    });

    if (!capturedSteps.length) throw new Error('No steps captured from URL');
    await job.progress(82);

    // Upload screenshots to R2
    const stepDocs = [];
    for (const step of capturedSteps) {
      let screenshotUrl = null;
      if (step.screenshotPath) {
        try {
          const buffer = await fs.readFile(step.screenshotPath);
          const filename = step.screenshotPath.split('/').pop();
          const { url } = await uploadFile(buffer, filename, 'image/png', 'screenshots');
          screenshotUrl = url;
          await fs.unlink(step.screenshotPath).catch(() => {});
        } catch {}
      }

      stepDocs.push({
        tutorialId,
        stepNumber: step.stepNumber,
        instructionText: step.instructionText,
        screenshotUrl,
        clickTarget: step.clickTarget || {},
        transactionDetails: { requiresTransaction: false, transactionCount: 1 },
      });
    }

    // Save steps to DB
    await TutorialStep.deleteMany({ tutorialId }); // Clear any existing steps
    const savedSteps = await TutorialStep.insertMany(stepDocs);

    tutorial.steps = savedSteps.map(s => s._id);
    // Auto-queue video/image generation after capture
    const outputType = job.data.outputType || 'video';
    const jobData = {
      tutorialId: tutorial._id.toString(),
      userId: job.data.userId,
      outputType,
      voiceSettings: tutorial.voiceSettings,
    };
    if (outputType === 'video' || outputType === 'both') {
      await videoQueue.add('generate-video', jobData);
    }
    if (outputType === 'image' || outputType === 'both') {
      await imageQueue.add('generate-images', jobData);
    }
    tutorial.status = 'processing';
    await tutorial.save();

    await job.progress(100);
    console.log(`[CaptureWorker] Captured ${savedSteps.length} steps for tutorial ${tutorialId}`);
    return { status: 'completed', stepCount: savedSteps.length };

  } catch (err) {
    console.error(`[CaptureWorker] Job ${job.id} failed:`, err.message);
    await Tutorial.findByIdAndUpdate(tutorialId, { status: 'failed' }).catch(() => {});
    throw err;
  }
});

captureQueue.on('failed', (job, err) => {
  console.error(`[CaptureQueue] Job ${job.id} failed: ${err.message}`);
});

console.log('[CaptureWorker] Ready and listening for jobs');
