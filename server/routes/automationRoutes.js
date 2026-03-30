const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/capture', automationController.startCapture);
router.get('/status/:jobId', automationController.getCaptureStatus);
router.post('/cancel/:jobId', automationController.cancelCapture);

module.exports = router;
