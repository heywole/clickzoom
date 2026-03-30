const Tutorial = require('../models/Tutorial');
const { createUrlFingerprint } = require('../utils/helpers');

const checkFreeTierLock = async (req, res, next) => {
  try {
    if (!req.user) return next();
    if (req.user.subscriptionTier !== 'free') return next();

    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return next();
    if (tutorial.creatorId.toString() !== req.user._id.toString()) return next();

    if (tutorial.isLocked) {
      return res.status(403).json({
        message: 'You have already generated content for this tutorial. Upgrade to Pro to generate additional output types.',
        isLocked: true,
        lockedOutputType: tutorial.lockedOutputType,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

const checkUrlUniqueness = async (req, res, next) => {
  try {
    if (!req.user || req.user.subscriptionTier !== 'free') return next();
    const { targetUrl } = req.body;
    if (!targetUrl) return next();

    const fingerprint = createUrlFingerprint(targetUrl);
    const existing = await Tutorial.findOne({
      creatorId: req.user._id,
      urlFingerprint: fingerprint,
      isLocked: true,
    });

    if (existing) {
      return res.status(403).json({
        message: 'You have already generated content for this URL. Upgrade to Pro to create additional tutorials from the same URL.',
        existingTutorialId: existing._id,
      });
    }
    req.urlFingerprint = fingerprint;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkFreeTierLock, checkUrlUniqueness };
