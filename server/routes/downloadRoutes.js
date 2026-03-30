const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getFilePath, scheduleDelete } = require('../config/storage');
const { authenticate } = require('../middleware/auth');

const OUTPUT_DIR = path.join(__dirname, '../uploads/output');

/**
 * GET /downloads/:folder/:filename
 * Serves generated files for download then schedules cleanup
 */
router.get('/:folder/:filename', authenticate, (req, res) => {
  const { folder, filename } = req.params;

  // Security: prevent path traversal
  const safeName = path.basename(filename);
  const safeFolder = path.basename(folder);
  const filePath = path.join(OUTPUT_DIR, safeFolder, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found or already downloaded' });
  }

  const ext = path.extname(safeName).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.srt': 'text/plain',
    '.wav': 'audio/wav',
  };

  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  const downloadName = `clickzoom_${safeFolder}_${Date.now()}${ext}`;

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  // Schedule cleanup 1 hour after download
  fileStream.on('end', () => {
    scheduleDelete(`${safeFolder}/${safeName}`, 60 * 60 * 1000);
  });

  fileStream.on('error', (err) => {
    console.error('[Download] Stream error:', err.message);
    if (!res.headersSent) res.status(500).json({ message: 'Download failed' });
  });
});

module.exports = router;
