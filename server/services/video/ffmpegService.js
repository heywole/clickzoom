const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../uploads/output');

const ensureDir = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
};

const RESOLUTION_MAP = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4K': { width: 3840, height: 2160 },
};

/**
 * Generate a video from tutorial steps with zoom effects
 */
const generateTutorialVideo = async (steps, voiceSettings, options = {}) => {
  await ensureDir();

  const { resolution = '1080p', format = 'mp4', tutorialId } = options;
  const { width, height } = RESOLUTION_MAP[resolution] || RESOLUTION_MAP['1080p'];
  const outputPath = path.join(OUTPUT_DIR, `${tutorialId}_${Date.now()}.${format}`);

  // Build filter complex for zoom effects
  // Each step: show screenshot, zoom in on target, hold, zoom out
  const filterParts = [];
  const inputArgs = [];
  let inputIndex = 0;

  for (const step of steps) {
    if (step.screenshotPath && existsSync(step.screenshotPath)) {
      inputArgs.push('-loop', '1', '-t', '4', '-i', step.screenshotPath);

      const ct = step.clickTarget;
      if (ct && ct.xCoordinate && ct.yCoordinate) {
        const zoomX = Math.max(0, ct.xCoordinate / width - 0.2);
        const zoomY = Math.max(0, ct.yCoordinate / height - 0.2);

        // Zoom in (0.5s) -> hold (1.5s) -> zoom out (0.5s) -> rest
        filterParts.push(
          `[${inputIndex}:v]scale=${width}:${height},` +
          `zoompan=z='if(lte(on,12),1,if(lte(on,24),1+(on-12)*0.125,if(lte(on,60),2.5,if(lte(on,72),2.5-(on-60)*0.125,1))))':` +
          `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=96:s=${width}x${height}` +
          `[v${inputIndex}]`
        );
      } else {
        filterParts.push(`[${inputIndex}:v]scale=${width}:${height}[v${inputIndex}]`);
      }
      inputIndex++;
    }
  }

  if (inputIndex === 0) throw new Error('No valid screenshots found for video generation');

  const concatInputs = Array.from({ length: inputIndex }, (_, i) => `[v${i}]`).join('');
  filterParts.push(`${concatInputs}concat=n=${inputIndex}:v=1:a=0[outv]`);

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    inputArgs.forEach((arg, i) => {
      if (i % 2 === 0) cmd = cmd.input(inputArgs[i + 1]);
    });

    cmd
      .complexFilter(filterParts.join(';'))
      .outputOption('-map', '[outv]')
      .outputOption('-r', '24')
      .outputOption('-c:v', 'libx264')
      .outputOption('-preset', 'fast')
      .outputOption('-crf', '23')
      .outputOption('-pix_fmt', 'yuv420p')
      .output(outputPath)
      .on('progress', (p) => console.log(`[FFmpeg] ${Math.round(p.percent || 0)}%`))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Add voiceover audio to video
 */
const mergeAudio = async (videoPath, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOption('-c:v', 'copy')
      .outputOption('-c:a', 'aac')
      .outputOption('-shortest')
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};

/**
 * Add subtitles burned into video
 */
const burnSubtitles = async (videoPath, srtPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .outputOption(`-vf`, `subtitles='${srtPath}':force_style='FontName=Arial,FontSize=18,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2,Shadow=1'`)
      .outputOption('-c:a', 'copy')
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};

/**
 * Add intro/outro branding screens
 */
const addBranding = async (videoPath, outputPath) => {
  // In production: prepend 3s intro and append 3s outro with ClickZoom branding
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .outputOption('-c', 'copy')
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};

module.exports = { generateTutorialVideo, mergeAudio, burnSubtitles, addBranding };
