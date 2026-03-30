const { captureQueue } = require('../config/queue');
const Tutorial = require('../models/Tutorial');

exports.startCapture = async (req, res, next) => {
  try {
    const { tutorialId, targetUrl } = req.body;
    if (!tutorialId || !targetUrl) return res.status(400).json({ message: 'tutorialId and targetUrl required' });

    const tutorial = await Tutorial.findOne({ _id: tutorialId, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });

    const job = await captureQueue.add('capture-url', {
      tutorialId,
      targetUrl,
      userId: req.user._id.toString(),
    });

    tutorial.status = 'processing';
    await tutorial.save();

    res.json({ message: 'Capture started', jobId: job.id, status: 'processing' });
  } catch (err) {
    next(err);
  }
};

exports.getCaptureStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await captureQueue.getJob(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      jobId,
      state,
      progress,
      result: state === 'completed' ? job.returnvalue : null,
      failedReason: state === 'failed' ? job.failedReason : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelCapture = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await captureQueue.getJob(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.remove();
    res.json({ message: 'Capture cancelled' });
  } catch (err) {
    next(err);
  }
};
