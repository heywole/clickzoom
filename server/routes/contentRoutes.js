const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/:tutorialId', contentController.getContent);
router.get('/:tutorialId/status', contentController.getContentStatus);
router.post('/:tutorialId/retry', contentController.retryGeneration);
router.delete('/:id', contentController.deleteContent);

module.exports = router;
