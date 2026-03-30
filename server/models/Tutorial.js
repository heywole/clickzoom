const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  targetUrl: { type: String, trim: true },
  inputMethod: { type: String, enum: ['manual', 'automated'], default: 'automated' },
  outputType: { type: String, enum: ['video', 'image', 'both'] },
  status: { type: String, enum: ['draft', 'processing', 'completed', 'failed'], default: 'draft' },
  isLocked: { type: Boolean, default: false },
  lockedOutputType: { type: String, enum: ['video', 'image'] },
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorialStep' }],
  urlFingerprint: { type: String },
  voiceSettings: {
    language: { type: String, default: 'en' },
    voiceType: { type: String, enum: ['male', 'female', 'neutral'], default: 'female' },
    voiceStyle: { type: String, enum: ['professional', 'friendly', 'energetic', 'calm'], default: 'professional' },
    speed: { type: Number, default: 1, min: 0.75, max: 1.5 },
    accent: { type: String },
  },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

tutorialSchema.index({ creatorId: 1, createdAt: -1 });
tutorialSchema.index({ urlFingerprint: 1, creatorId: 1 });

module.exports = mongoose.model('Tutorial', tutorialSchema);
