const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventType: { type: String, enum: ['view', 'share', 'download', 'embed'], required: true },
  deviceType: String,
  country: String,
}, { timestamps: true });

analyticsSchema.index({ tutorialId: 1, eventType: 1 });
analyticsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
