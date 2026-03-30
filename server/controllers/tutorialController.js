const Tutorial = require('../models/Tutorial');
const TutorialStep = require('../models/TutorialStep');
const { createUrlFingerprint, paginate } = require('../utils/helpers');

exports.createTutorial = async (req, res, next) => {
  try {
    const { title, description, targetUrl, inputMethod, outputType, voiceSettings, steps } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const tutorialData = {
      creatorId: req.user._id,
      title: title.trim(),
      description: description?.trim(),
      targetUrl: targetUrl?.trim(),
      inputMethod: inputMethod || 'automated',
      outputType,
      voiceSettings: voiceSettings || {},
      status: 'draft',
    };

    if (targetUrl) {
      tutorialData.urlFingerprint = createUrlFingerprint(targetUrl);
    }

    const tutorial = await Tutorial.create(tutorialData);

    // Create manual steps if provided
    if (steps && steps.length > 0 && inputMethod === 'manual') {
      const stepDocs = await TutorialStep.insertMany(
        steps.map((s, i) => ({
          tutorialId: tutorial._id,
          stepNumber: i + 1,
          instructionText: s.instructionText,
          clickTarget: s.clickTarget || {},
          transactionDetails: s.transactionDetails || {},
        }))
      );
      tutorial.steps = stepDocs.map(s => s._id);
      await tutorial.save();
    }

    res.status(201).json({ tutorial });
  } catch (err) {
    next(err);
  }
};

exports.getTutorials = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status, search } = req.query;
    const query = { creatorId: req.user._id };
    if (status && status !== 'all') query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const { skip, limit: lim } = paginate(page, limit);
    const [tutorials, total] = await Promise.all([
      Tutorial.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).populate('steps', 'stepNumber instructionText'),
      Tutorial.countDocuments(query),
    ]);

    res.json({
      tutorials,
      pagination: { page: parseInt(page), limit: lim, total, pages: Math.ceil(total / lim) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTutorialById = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, creatorId: req.user._id })
      .populate({ path: 'steps', options: { sort: { stepNumber: 1 } } });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    res.json({ tutorial });
  } catch (err) {
    next(err);
  }
};

exports.updateTutorial = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (tutorial.status === 'processing') return res.status(400).json({ message: 'Cannot edit a tutorial that is currently processing' });

    const allowed = ['title', 'description', 'targetUrl', 'voiceSettings', 'outputType'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) tutorial[field] = req.body[field];
    });

    await tutorial.save();
    res.json({ tutorial });
  } catch (err) {
    next(err);
  }
};

exports.deleteTutorial = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOneAndDelete({ _id: req.params.id, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    await TutorialStep.deleteMany({ tutorialId: tutorial._id });
    res.json({ message: 'Tutorial deleted' });
  } catch (err) {
    next(err);
  }
};

exports.createStep = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, creatorId: req.user._id });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });

    const stepNumber = (await TutorialStep.countDocuments({ tutorialId: tutorial._id })) + 1;
    const step = await TutorialStep.create({
      tutorialId: tutorial._id,
      stepNumber,
      instructionText: req.body.instructionText,
      clickTarget: req.body.clickTarget || {},
      transactionDetails: req.body.transactionDetails || {},
    });

    tutorial.steps.push(step._id);
    await tutorial.save();
    res.status(201).json({ step });
  } catch (err) {
    next(err);
  }
};

exports.getSteps = async (req, res, next) => {
  try {
    const steps = await TutorialStep.find({ tutorialId: req.params.id }).sort({ stepNumber: 1 });
    res.json({ steps });
  } catch (err) {
    next(err);
  }
};

exports.updateStep = async (req, res, next) => {
  try {
    const step = await TutorialStep.findOneAndUpdate(
      { _id: req.params.stepId, tutorialId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!step) return res.status(404).json({ message: 'Step not found' });
    res.json({ step });
  } catch (err) {
    next(err);
  }
};

exports.deleteStep = async (req, res, next) => {
  try {
    const step = await TutorialStep.findOneAndDelete({ _id: req.params.stepId, tutorialId: req.params.id });
    if (!step) return res.status(404).json({ message: 'Step not found' });
    await Tutorial.findByIdAndUpdate(req.params.id, { $pull: { steps: step._id } });
    // Renumber remaining steps
    const remaining = await TutorialStep.find({ tutorialId: req.params.id }).sort({ stepNumber: 1 });
    await Promise.all(remaining.map((s, i) => TutorialStep.findByIdAndUpdate(s._id, { stepNumber: i + 1 })));
    res.json({ message: 'Step deleted' });
  } catch (err) {
    next(err);
  }
};

exports.reorderSteps = async (req, res, next) => {
  try {
    const { stepIds } = req.body;
    if (!Array.isArray(stepIds)) return res.status(400).json({ message: 'stepIds array required' });
    await Promise.all(stepIds.map((id, i) => TutorialStep.findByIdAndUpdate(id, { stepNumber: i + 1 })));
    await Tutorial.findByIdAndUpdate(req.params.id, { steps: stepIds });
    res.json({ message: 'Steps reordered' });
  } catch (err) {
    next(err);
  }
};
