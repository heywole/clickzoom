const mongoose = require('mongoose');

const generatedContentSchema = new mongoose.Schema({
  tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  contentType: { type: String, enum: ['video', 'image_set'], required: true },
  fileUrls: [{ type: String }],
  fileKeys: [{ type: String }],
  thumbnailUrl: String,
  fileSize: Number,
  duration: Number,
  processingStatus: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
  processingLog: String,
  generatedAt: Date,
  expiresAt: Date,
  qualitySettings: {
    resolution: { type: String, default: '1080p' },
    bitrate: String,
    format: String,
  },
}, { timestamps: true });

generatedContentSchema.index({ tutorialId: 1 });

module.exports = mongoose.model('GeneratedContent', generatedContentSchema);
