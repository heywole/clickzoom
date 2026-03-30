const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { cropZoomInset } = require('./sharpService');

const OUTPUT_DIR = path.join(__dirname, '../../uploads/output');

/**
 * Creates an SVG overlay with:
 * - Neon Mint highlight ring around click target
 * - Step number badge
 * - Zoom inset box border
 */
const createSvgOverlay = (width, height, clickTarget, stepNumber, insetSize = 200, padding = 16) => {
  const { xCoordinate: x, yCoordinate: y, description } = clickTarget;
  const ringRadius = 28;

  // Inset box position (bottom-right)
  const insetLeft = width - insetSize - padding;
  const insetTop = height - insetSize - padding;

  const labelText = (description || `Step ${stepNumber}`).substring(0, 40);

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Highlight ring around click target -->
      <circle cx="${x}" cy="${y}" r="${ringRadius}" fill="none" stroke="#00E5A0" stroke-width="3" opacity="0.9"/>
      <circle cx="${x}" cy="${y}" r="${ringRadius + 8}" fill="none" stroke="#00E5A0" stroke-width="1.5" opacity="0.4"/>

      <!-- Crosshair lines -->
      <line x1="${x - ringRadius - 10}" y1="${y}" x2="${x - ringRadius + 5}" y2="${y}" stroke="#00E5A0" stroke-width="2"/>
      <line x1="${x + ringRadius - 5}" y1="${y}" x2="${x + ringRadius + 10}" y2="${y}" stroke="#00E5A0" stroke-width="2"/>
      <line x1="${x}" y1="${y - ringRadius - 10}" x2="${x}" y2="${y - ringRadius + 5}" stroke="#00E5A0" stroke-width="2"/>
      <line x1="${x}" y1="${y + ringRadius - 5}" x2="${x}" y2="${y + ringRadius + 10}" stroke="#00E5A0" stroke-width="2"/>

      <!-- Label background -->
      <rect x="${Math.max(4, x - 120)}" y="${y - ringRadius - 36}" width="240" height="28" rx="6" fill="#0D1117" opacity="0.85"/>
      <text x="${Math.max(4, x - 120) + 8}" y="${y - ringRadius - 16}" font-family="Arial, sans-serif" font-size="13" fill="#FFFFFF">${labelText}</text>

      <!-- Step number badge -->
      <circle cx="${x + ringRadius + 4}" cy="${y - ringRadius - 4}" r="14" fill="#1A73E8"/>
      <text x="${x + ringRadius + 4}" y="${y - ringRadius}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">${stepNumber}</text>

      <!-- Inset box border -->
      <rect x="${insetLeft - 3}" y="${insetTop - 3}" width="${insetSize + 6}" height="${insetSize + 6}" rx="6" fill="none" stroke="#00E5A0" stroke-width="2.5"/>
      <text x="${insetLeft}" y="${insetTop - 8}" font-family="Arial, sans-serif" font-size="11" fill="#00E5A0">2.5x zoom</text>

      <!-- Connecting line from ring to inset (dashed) -->
      <line x1="${x}" y1="${y + ringRadius}" x2="${insetLeft + insetSize / 2}" y2="${insetTop}" stroke="#00E5A0" stroke-width="1" stroke-dasharray="5,4" opacity="0.5"/>
    </svg>
  `);
};

/**
 * Annotate a single screenshot with zoom effects and step markers
 */
const annotateScreenshot = async (screenshotPath, step, outputDir) => {
  const meta = await sharp(screenshotPath).metadata();
  const { width, height } = meta;
  const ct = step.clickTarget;

  if (!ct || !ct.xCoordinate || !ct.yCoordinate) {
    // No click target - just add step badge
    const svgBadge = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="20" fill="#1A73E8"/>
        <text x="40" y="46" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="white">${step.stepNumber}</text>
      </svg>`);
    const outPath = path.join(outputDir, `step_${step.stepNumber}_annotated.png`);
    await sharp(screenshotPath).composite([{ input: svgBadge, blend: 'over' }]).png().toFile(outPath);
    return outPath;
  }

  try {
    // Generate zoom inset
    const insetPath = await cropZoomInset(screenshotPath, ct.xCoordinate, ct.yCoordinate, { zoomLevel: 2.5, insetSize: 200 });

    // Create SVG overlay
    const svgOverlay = createSvgOverlay(width, height, ct, step.stepNumber);

    const insetSize = 200;
    const padding = 16;
    const insetBuffer = await sharp(insetPath).resize(insetSize, insetSize).toBuffer();

    const outPath = path.join(outputDir, `step_${step.stepNumber}_annotated.png`);
    await sharp(screenshotPath)
      .composite([
        { input: insetBuffer, left: width - insetSize - padding, top: height - insetSize - padding },
        { input: svgOverlay, blend: 'over' },
      ])
      .png()
      .toFile(outPath);

    // Cleanup inset temp file
    await fs.unlink(insetPath).catch(() => {});
    return outPath;
  } catch (err) {
    console.error(`Annotation failed for step ${step.stepNumber}:`, err.message);
    return screenshotPath;
  }
};

/**
 * Annotate all steps and return paths
 */
const annotateAllSteps = async (steps, tutorialId) => {
  const outputDir = path.join(OUTPUT_DIR, tutorialId);
  await fs.mkdir(outputDir, { recursive: true });

  const annotated = [];
  for (const step of steps) {
    if (step.screenshotPath) {
      const annotatedPath = await annotateScreenshot(step.screenshotPath, step, outputDir);
      annotated.push({ step, annotatedPath });
    }
  }
  return annotated;
};

module.exports = { annotateScreenshot, annotateAllSteps, createSvgOverlay };
