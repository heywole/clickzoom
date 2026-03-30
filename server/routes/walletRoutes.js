const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/status', walletController.getWalletStatus);
router.get('/balance', walletController.getWalletBalance);
router.get('/transactions', walletController.getTransactions);
router.put('/limits', walletController.updateLimits);

module.exports = router;
