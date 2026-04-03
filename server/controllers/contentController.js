const Tutorial = require('../models/Tutorial');
const GeneratedContent = require('../models/GeneratedContent');
const { videoQueue, imageQueue, captureQueue } = require('../config/queue');
const { sendContentReadyEmail } = require('../utils/email');
const { scheduleDelete } = require('../config/storage');
const User = require('../models/User');

exports.generateContent = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, creatorId: req.user._id }).populate('steps');
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (tutorial.status === 'processing') return res.status(400).json({ message: 'Tutorial is already processing' });

    const { outputType } = req.body;
    if (!outputType) return res.status(400).json({ message: 'outputType is required' });

    // Free tier: can only generate once
    if (req.user.subscriptionTier === 'free') {
      if (tutorial.isLocked) {
        return res.status(403).json({
          message: 'You have already generated content for this tutorial. Upgrade to Pro to generate additional output types.',
        });
      }
      if (outputType === 'both') {
        return res.status(403).json({ message: 'Both output types require a Pro subscription' });
      }
    }

    tutorial.outputType = outputType;
    tutorial.status = 'processing';
    await tutorial.save();

    // If tutorial has no steps and has a URL, run capture first
    if ((!tutorial.steps || tutorial.steps.length === 0) && tutorial.targetUrl) {
      await captureQueue.add('capture-url', {
        tutorialId: tutorial._id.toString(),
        userId: req.user._id.toString(),
        targetUrl: tutorial.targetUrl,
        outputType,
        voiceSettings: tutorial.voiceSettings,
      });
      return res.json({ message: 'Capturing tutorial content first', status: 'processing', tutorialId: tutorial._id });
    }

    const jobData = {
      tutorialId: tutorial._id.toString(),
      userId: req.user._id.toString(),
      outputType,
      steps: tutorial.steps,
      voiceSettings: tutorial.voiceSettings,
    };

    if (outputType === 'video' || outputType === 'both') {
      await videoQueue.add('generate-video', jobData, {
        priority: req.user.subscriptionTier !== 'free' ? 1 : 10,
      });
    }
    if (outputType === 'image' || outputType === 'both') {
      await imageQueue.add('generate-images', jobData, {
        priority: req.user.subscriptionTier !== 'free' ? 1 : 10,
      });
    }

    res.json({ message: 'Generation started', status: 'processing', tutorialId: tutorial._id });
  } catch (err) {
    next(err);
  }
};

exports.getContent = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    const content = await GeneratedContent.findOne({ tutorialId: tutorial._id });

    // Build full download URLs
    let contentWithUrls = null;
    if (content) {
      contentWithUrls = content.toObject();
      contentWithUrls.downloadUrls = content.fileUrls || [];
      contentWithUrls.storageNotice = 'Files hosted on Cloudinary. Download before expiry.';
    }

    res.json({ content: contentWithUrls, tutorialStatus: tutorial.status });
  } catch (err) {
    next(err);
  }
};

exports.getContentStatus = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    const content = await GeneratedContent.findOne({ tutorialId: tutorial._id });
    res.json({
      status: tutorial.status,
      processingStatus: content?.processingStatus,
      contentReady: tutorial.status === 'completed',
    });
  } catch (err) {
    next(err);
  }
};

exports.retryGeneration = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (tutorial.status !== 'failed') return res.status(400).json({ message: 'Only failed tutorials can be retried' });

    tutorial.status = 'processing';
    await tutorial.save();

    await videoQueue.add('generate-video', {
      tutorialId: tutorial._id.toString(),
      userId: req.user._id.toString(),
      outputType: tutorial.outputType,
      retry: true,
    });

    res.json({ message: 'Retry queued', status: 'processing' });
  } catch (err) {
    next(err);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const content = await GeneratedContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    // Delete local files
    if (content.fileKeys?.length) {
      for (const key of content.fileKeys) {
        await scheduleDelete(key, 0); // Delete immediately
      }
    }

    await GeneratedContent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted' });
  } catch (err) {
    next(err);
  }
};
