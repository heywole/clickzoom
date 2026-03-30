const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
const { LANGUAGES } = require('../utils/constants');

router.use(authenticate);

router.get('/options', (req, res) => {
  res.json({
    voiceTypes: ['male', 'female', 'neutral'],
    voiceStyles: ['professional', 'friendly', 'energetic', 'calm'],
    speeds: [0.75, 1, 1.25, 1.5],
  });
});

router.get('/language/list', (req, res) => {
  res.json({ languages: LANGUAGES });
});

router.post('/preview', async (req, res, next) => {
  try {
    const { language = 'en', voiceType = 'female', voiceStyle = 'professional', speed = 1 } = req.body;
    const text = `Hello! This is a preview of your selected voice. The style is ${voiceStyle} and the language is ${language}.`;
    // In production, call Coqui TTS
    res.json({ message: 'Preview generated', previewText: text, settings: { language, voiceType, voiceStyle, speed } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
