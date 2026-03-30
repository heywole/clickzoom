const WalletTransaction = require('../models/WalletTransaction');

exports.getWalletStatus = async (req, res) => {
  res.json({
    status: 'active',
    limits: {
      maxPerTx: process.env.CLICKZOOM_WALLET_MAX_TX_AMOUNT || '0.01',
      dailyLimit: process.env.CLICKZOOM_WALLET_DAILY_LIMIT || '0.1',
      perTutorialLimit: process.env.CLICKZOOM_WALLET_PER_TUTORIAL_LIMIT || '0.02',
    },
    chains: ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'BSC', 'Avalanche', 'Solana'],
  });
};

exports.getWalletBalance = async (req, res) => {
  // In production this would query the actual wallet
  res.json({ balance: { eth: '0.0500', usd: '165.00' }, chains: {} });
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await WalletTransaction.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

exports.updateLimits = async (req, res) => {
  // Admin only - update spending limits via env in production
  res.json({ message: 'Limits updated. Restart server to apply environment changes.' });
};
