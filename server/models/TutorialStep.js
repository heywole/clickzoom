const mongoose = require('mongoose');

const tutorialStepSchema = new mongoose.Schema({
  tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  stepNumber: { type: Number, required: true },
  instructionText: { type: String, required: true },
  screenshotUrl: { type: String },
  clickTarget: {
    description: String,
    xCoordinate: Number,
    yCoordinate: Number,
    elementSelector: String,
    zoomLevel: { type: Number, default: 2.5 },
    zoomInDuration: { type: Number, default: 0.5 },
    holdDuration: { type: Number, default: 1.5 },
    zoomOutDuration: { type: Number, default: 0.5 },
  },
  transactionDetails: {
    requiresTransaction: { type: Boolean, default: false },
    transactionCount: { type: Number, default: 1 },
    executedCount: { type: Number, default: 0 },
    overlayText: String,
  },
}, { timestamps: true });

tutorialStepSchema.index({ tutorialId: 1, stepNumber: 1 });

module.exports = mongoose.model('TutorialStep', tutorialStepSchema);
