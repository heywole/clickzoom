const WalletTransaction = require('../../models/WalletTransaction');

const MAX_TX = parseFloat(process.env.CLICKZOOM_WALLET_MAX_TX_AMOUNT || '0.01');
const DAILY_LIMIT = parseFloat(process.env.CLICKZOOM_WALLET_DAILY_LIMIT || '0.1');
const PER_TUTORIAL_LIMIT = parseFloat(process.env.CLICKZOOM_WALLET_PER_TUTORIAL_LIMIT || '0.02');
const ALERT_THRESHOLD = 0.8;

const checkLimits = async ({ amount, tutorialId, chain }) => {
  const txAmount = parseFloat(amount);
  const violations = [];

  if (txAmount > MAX_TX) violations.push({ type: 'max_per_tx', limit: MAX_TX, requested: txAmount });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyTxs = await WalletTransaction.find({ status: 'confirmed', createdAt: { $gte: today } });
  const dailyTotal = dailyTxs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  if (dailyTotal + txAmount > DAILY_LIMIT) violations.push({ type: 'daily_limit', limit: DAILY_LIMIT, used: dailyTotal });

  if (tutorialId) {
    const tTxs = await WalletTransaction.find({ tutorialId, status: 'confirmed' });
    const tTotal = tTxs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    if (tTotal + txAmount > PER_TUTORIAL_LIMIT) violations.push({ type: 'per_tutorial', limit: PER_TUTORIAL_LIMIT, used: tTotal });
  }

  // Alert at 80%
  if (dailyTotal / DAILY_LIMIT >= ALERT_THRESHOLD) {
    console.warn(`[WALLET ALERT] Daily limit ${Math.round((dailyTotal / DAILY_LIMIT) * 100)}% used`);
  }

  return { allowed: violations.length === 0, violations };
};

const recordTransaction = async (data) => WalletTransaction.create(data);

module.exports = { checkLimits, recordTransaction };
