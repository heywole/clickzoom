const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const COQUI_URL = process.env.COQUI_TTS_URL || 'http://localhost:5002';
const OUTPUT_DIR = path.join(__dirname, '../../uploads/audio');

const ensureDir = async () => { await fs.mkdir(OUTPUT_DIR, { recursive: true }); };

/**
 * Generate voiceover audio for a tutorial step
 */
const generateVoiceover = async (text, voiceSettings = {}, outputFilename) => {
  await ensureDir();

  const { language = 'en', voiceType = 'female', voiceStyle = 'professional', speed = 1 } = voiceSettings;
  const outputPath = path.join(OUTPUT_DIR, outputFilename || `voice_${Date.now()}.wav`);

  try {
    const response = await axios.post(`${COQUI_URL}/api/tts`, {
      text,
      language,
      speaker: mapVoiceType(voiceType),
      style: voiceStyle,
      speed,
    }, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    await fs.writeFile(outputPath, response.data);
    return outputPath;
  } catch (err) {
    // If Coqui is not available, create silent placeholder
    console.warn('[Coqui TTS] Not available, using silent placeholder:', err.message);
    return createSilentAudio(outputPath, 4);
  }
};

/**
 * Generate voiceover for all steps and concatenate
 */
const generateFullVoiceover = async (steps, voiceSettings, tutorialId) => {
  await ensureDir();
  const audioPaths = [];

  for (const step of steps) {
    const filename = `${tutorialId}_step_${step.stepNumber}.wav`;
    const audioPath = await generateVoiceover(step.instructionText, voiceSettings, filename);
    audioPaths.push(audioPath);
  }

  return audioPaths;
};

/**
 * Generate a preview sample (10 seconds)
 */
const generatePreview = async (voiceSettings) => {
  const previewText = 'Welcome to ClickZoom. This is a preview of your selected voice and style. You can adjust the language, type, and speed to match your preferences.';
  return generateVoiceover(previewText, voiceSettings, `preview_${Date.now()}.wav`);
};

const mapVoiceType = (type) => {
  const map = { male: 'male_1', female: 'female_1', neutral: 'neutral_1' };
  return map[type] || 'female_1';
};

const createSilentAudio = async (outputPath, durationSeconds = 4) => {
  // Creates a minimal silent WAV file as fallback
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  await fs.writeFile(outputPath, buffer);
  return outputPath;
};

module.exports = { generateVoiceover, generateFullVoiceover, generatePreview };
