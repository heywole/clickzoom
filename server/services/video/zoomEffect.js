/**
 * Calculates zoom effect parameters for a given click target
 * Returns FFmpeg-compatible filter parameters
 */
const calculateZoomParams = (clickTarget, frameWidth = 1920, frameHeight = 1080) => {
  const { xCoordinate: x, yCoordinate: y, zoomLevel = 2.5, zoomInDuration = 0.5, holdDuration = 1.5, zoomOutDuration = 0.5 } = clickTarget;

  const fps = 24;
  const zoomInFrames = Math.round(zoomInDuration * fps);
  const holdFrames = Math.round(holdDuration * fps);
  const zoomOutFrames = Math.round(zoomOutDuration * fps);

  // Target pan coordinates (keep click target centered during zoom)
  const targetX = Math.max(0, Math.min(x - frameWidth / (2 * zoomLevel), frameWidth * (1 - 1 / zoomLevel)));
  const targetY = Math.max(0, Math.min(y - frameHeight / (2 * zoomLevel), frameHeight * (1 - 1 / zoomLevel)));

  return {
    zoomLevel,
    zoomInFrames,
    holdFrames,
    zoomOutFrames,
    targetX: Math.round(targetX),
    targetY: Math.round(targetY),
    totalFrames: zoomInFrames + holdFrames + zoomOutFrames,
  };
};

/**
 * Build the zoompan expression for FFmpeg
 */
const buildZoompanExpression = (params, extraFrames = 48) => {
  const { zoomLevel, zoomInFrames, holdFrames, zoomOutFrames, targetX, targetY } = params;
  const zi = zoomInFrames;
  const h = holdFrames;
  const zo = zoomOutFrames;
  const total = zi + h + zo + extraFrames;
  const step = (zoomLevel - 1) / zi;

  const zExpr = `if(lte(on,${zi}),1+on*${step.toFixed(6)},if(lte(on,${zi + h}),${zoomLevel},if(lte(on,${zi + h + zo}),${zoomLevel}-(on-${zi + h})*${step.toFixed(6)},1)))`;
  const xExpr = `if(lte(on,${zi}),iw/2-(iw/zoom/2)+on*${(targetX / zi).toFixed(2)},if(lte(on,${zi + h}),${targetX},if(lte(on,${zi + h + zo}),${targetX}-(on-${zi + h})*${(targetX / zo).toFixed(2)},iw/2-(iw/zoom/2))))`;
  const yExpr = `if(lte(on,${zi}),ih/2-(ih/zoom/2)+on*${(targetY / zi).toFixed(2)},if(lte(on,${zi + h}),${targetY},if(lte(on,${zi + h + zo}),${targetY}-(on-${zi + h})*${(targetY / zo).toFixed(2)},ih/2-(ih/zoom/2))))`;

  return { zExpr, xExpr, yExpr, totalFrames: total };
};

/**
 * Generate highlight ring SVG overlay (burned in via FFmpeg drawbox/overlay)
 */
const generateHighlightRing = (x, y, radius = 30) => ({
  x1: x - radius, y1: y - radius,
  x2: x + radius, y2: y + radius,
  color: '0x00E5A0',
  thickness: 3,
});

module.exports = { calculateZoomParams, buildZoompanExpression, generateHighlightRing };
