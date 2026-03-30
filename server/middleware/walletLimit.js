const WalletTransaction = require('../models/WalletTransaction');

const MAX_TX_AMOUNT = parseFloat(process.env.CLICKZOOM_WALLET_MAX_TX_AMOUNT || '0.01');
const DAILY_LIMIT = parseFloat(process.env.CLICKZOOM_WALLET_DAILY_LIMIT || '0.1');
const PER_TUTORIAL_LIMIT = parseFloat(process.env.CLICKZOOM_WALLET_PER_TUTORIAL_LIMIT || '0.02');
const ALERT_THRESHOLD = 0.8;

const checkTransactionLimits = async (req, res, next) => {
  try {
    const { amount, tutorialId, chain } = req.body;
    const txAmount = parseFloat(amount || '0');

    if (txAmount > MAX_TX_AMOUNT) {
      await WalletTransaction.create({
        tutorialId, chain, amount, status: 'limit_exceeded', limitApplied: 'max_per_tx',
      });
      return res.status(403).json({ message: 'Transaction exceeds maximum allowed amount', limit: MAX_TX_AMOUNT });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTxs = await WalletTransaction.find({ status: 'confirmed', createdAt: { $gte: today } });
    const dailyTotal = dailyTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

    if (dailyTotal + txAmount > DAILY_LIMIT) {
      return res.status(403).json({ message: 'Daily spending limit reached', limit: DAILY_LIMIT, used: dailyTotal });
    }

    if (dailyTotal + txAmount >= DAILY_LIMIT * ALERT_THRESHOLD) {
      console.warn(`[WALLET ALERT] Daily limit at ${Math.round(((dailyTotal + txAmount) / DAILY_LIMIT) * 100)}%`);
    }

    if (tutorialId) {
      const tutorialTxs = await WalletTransaction.find({ tutorialId, status: 'confirmed' });
      const tutorialTotal = tutorialTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
      if (tutorialTotal + txAmount > PER_TUTORIAL_LIMIT) {
        return res.status(403).json({ message: 'Per-tutorial spending limit reached', limit: PER_TUTORIAL_LIMIT });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkTransactionLimits };
