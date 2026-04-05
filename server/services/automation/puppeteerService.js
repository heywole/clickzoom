const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const clickDetector = require('./clickDetector');

const SCREENSHOT_DIR = path.join(__dirname, '../../uploads/temp');

const ensureDir = async () => {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
};

const launchBrowser = async () => {
  return puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--window-size=1440,900',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });
};

const captureUrl = async (targetUrl, tutorialId, onProgress) => {
  await ensureDir();
  const browser = await launchBrowser();
  const steps = [];

  try {
    const page = await browser.newPage();

    // Stealth mode - bypass bot detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // Intercept wallet connection prompts
    await page.setRequestInterception(true);
    page.on('request', (request) => request.continue());

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    onProgress && onProgress(10);

    // Capture initial state
    const initialShot = path.join(SCREENSHOT_DIR, `${tutorialId}_step_0.png`);
    await page.screenshot({ path: initialShot, fullPage: false });

    const clickTargets = await clickDetector.detectInteractiveElements(page);
    onProgress && onProgress(30);

    for (let i = 0; i < Math.min(clickTargets.length, 20); i++) {
      const target = clickTargets[i];
      try {
        const screenshotPath = path.join(SCREENSHOT_DIR, `${tutorialId}_step_${i + 1}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        steps.push({
          stepNumber: i + 1,
          instructionText: `Click on "${target.text || target.ariaLabel || target.selector}"`,
          screenshotPath,
          clickTarget: {
            description: target.text || target.ariaLabel || '',
            xCoordinate: target.x,
            yCoordinate: target.y,
            elementSelector: target.selector,
            zoomLevel: 2.5,
            zoomInDuration: 0.5,
            holdDuration: 1.5,
            zoomOutDuration: 0.5,
          },
        });

        onProgress && onProgress(30 + Math.round((i / clickTargets.length) * 50));
      } catch (stepErr) {
        console.warn(`Step ${i + 1} capture failed:`, stepErr.message);
      }
    }

    onProgress && onProgress(90);
    return steps;
  } finally {
    await browser.close();
  }
};

const detectWalletPrompt = async (page) => {
  const walletSelectors = [
    '[data-testid="connect-wallet"]',
    'button:contains("Connect Wallet")',
    'button:contains("Connect")',
    '[class*="wallet-connect"]',
    '[id*="wallet-connect"]',
  ];
  for (const sel of walletSelectors) {
    try {
      const el = await page.$(sel);
      if (el) return { found: true, selector: sel };
    } catch {}
  }
  return { found: false };
};

module.exports = { captureUrl, detectWalletPrompt, launchBrowser };
