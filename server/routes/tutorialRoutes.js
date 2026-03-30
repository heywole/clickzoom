const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorialController');
const contentController = require('../controllers/contentController');
const { authenticate } = require('../middleware/auth');
const { checkFreeTierLock, checkUrlUniqueness } = require('../middleware/freetierCheck');
const { generateLimiter } = require('../middleware/rateLimit');

router.use(authenticate);

// Tutorial CRUD
router.post('/', checkUrlUniqueness, tutorialController.createTutorial);
router.get('/', tutorialController.getTutorials);
router.get('/:id', tutorialController.getTutorialById);
router.put('/:id', tutorialController.updateTutorial);
router.delete('/:id', tutorialController.deleteTutorial);

// Generation
router.post('/:id/generate', generateLimiter, checkFreeTierLock, contentController.generateContent);

// Steps
router.post('/:id/steps', tutorialController.createStep);
router.get('/:id/steps', tutorialController.getSteps);
router.put('/:id/steps/:stepId', tutorialController.updateStep);
router.delete('/:id/steps/:stepId', tutorialController.deleteStep);
router.post('/:id/steps/reorder', tutorialController.reorderSteps);

module.exports = router;
