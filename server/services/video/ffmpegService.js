const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../uploads/output');

const ensureDir = async () => { await fs.mkdir(OUTPUT_DIR, { recursive: true }); };

const generateTutorialVideo = async (steps, voiceSettings, options = {}) => {
  await ensureDir();
  const { format = 'mp4', tutorialId } = options;
  const outputPath = path.join(OUTPUT_DIR, `${tutorialId}_${Date.now()}.${format}`);

  const validSteps = steps.filter(s => s.screenshotPath && existsSync(s.screenshotPath));
  if (!validSteps.length) throw new Error('No valid screenshots found for video generation');

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    validSteps.forEach(s => {
      cmd = cmd.input(s.screenshotPath).inputOptions(['-loop 1', '-t 3']);
    });

    const filterParts = validSteps.map((_, i) => `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`);
    const concatInputs = validSteps.map((_, i) => `[v${i}]`).join('');
    filterParts.push(`${concatInputs}concat=n=${validSteps.length}:v=1:a=0[outv]`);

    cmd
      .complexFilter(filterParts.join(';'))
      .outputOption('-map', '[outv]')
      .outputOption('-r', '24')
      .outputOption('-c:v', 'libx264')
      .outputOption('-preset', 'ultrafast')
      .outputOption('-crf', '28')
      .outputOption('-pix_fmt', 'yuv420p')
      .outputOption('-threads', '1')
      .output(outputPath)
      .on('progress', (p) => console.log(`[FFmpeg] ${Math.round(p.percent || 0)}%`))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

const mergeAudio = async (videoPath, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg().input(videoPath).input(audioPath)
      .outputOption('-c:v', 'copy').outputOption('-c:a', 'aac').outputOption('-shortest')
      .output(outputPath).on('end', () => resolve(outputPath)).on('error', reject).run();
  });
};

module.exports = { generateTutorialVideo, mergeAudio };
