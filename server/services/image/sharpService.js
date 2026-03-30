const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const OUTPUT_DIR = path.join(__dirname, '../../uploads/output');

const ensureDir = async () => { await fs.mkdir(OUTPUT_DIR, { recursive: true }); };

/**
 * Resize and optimize a screenshot
 */
const processScreenshot = async (inputPath, options = {}) => {
  const { width = 1920, quality = 90 } = options;
  const outputPath = inputPath.replace('.png', '_processed.png');
  await sharp(inputPath)
    .resize(width, null, { withoutEnlargement: true })
    .png({ quality })
    .toFile(outputPath);
  return outputPath;
};

/**
 * Crop a zoomed inset from around the click target
 */
const cropZoomInset = async (inputPath, x, y, options = {}) => {
  const { zoomLevel = 2.5, insetSize = 240 } = options;
  const img = sharp(inputPath);
  const meta = await img.metadata();

  const cropW = Math.round(insetSize / zoomLevel);
  const cropH = Math.round(insetSize / zoomLevel);
  const cropX = Math.max(0, Math.min(x - cropW / 2, meta.width - cropW));
  const cropY = Math.max(0, Math.min(y - cropH / 2, meta.height - cropH));

  const outputPath = inputPath.replace('.png', `_inset_${x}_${y}.png`);
  await sharp(inputPath)
    .extract({ left: Math.round(cropX), top: Math.round(cropY), width: cropW, height: cropH })
    .resize(insetSize, insetSize)
    .png()
    .toFile(outputPath);

  return outputPath;
};

/**
 * Composite annotated image: original + inset + step number badge
 */
const compositeAnnotation = async (screenshotPath, insetPath, stepNumber, outputPath) => {
  await ensureDir();

  const baseMeta = await sharp(screenshotPath).metadata();
  const insetSize = 200;
  const padding = 16;

  // Position inset in bottom-right corner
  const insetLeft = baseMeta.width - insetSize - padding;
  const insetTop = baseMeta.height - insetSize - padding;

  const insetBuffer = await sharp(insetPath)
    .resize(insetSize, insetSize)
    .toBuffer();

  await sharp(screenshotPath)
    .composite([{ input: insetBuffer, left: insetLeft, top: insetTop }])
    .toFile(outputPath);

  return outputPath;
};

module.exports = { processScreenshot, cropZoomInset, compositeAnnotation };
