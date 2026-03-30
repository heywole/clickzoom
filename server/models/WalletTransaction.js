const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
  stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorialStep' },
  chain: { type: String, required: true },
  transactionHash: String,
  fromAddress: String,
  toAddress: String,
  amount: String,
  approvedAmount: String,
  limitApplied: String,
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'limit_exceeded'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
