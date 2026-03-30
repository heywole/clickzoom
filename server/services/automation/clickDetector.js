const detectInteractiveElements = async (page) => {
  return page.evaluate(() => {
    const elements = [];
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input[type="submit"]',
      'input[type="button"]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      'label[for]',
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        if (rect.top < 0 || rect.top > window.innerHeight) return;

        const text = (el.textContent || '').trim().substring(0, 80);
        const ariaLabel = el.getAttribute('aria-label') || '';
        const placeholder = el.getAttribute('placeholder') || '';

        elements.push({
          selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ')[0]}` : ''),
          text: text || ariaLabel || placeholder,
          ariaLabel,
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          tagName: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || '',
        });
      });
    });

    // Remove duplicates by position
    const seen = new Set();
    return elements.filter(el => {
      const key = `${Math.round(el.x / 5)},${Math.round(el.y / 5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 30);
  });
};

const detectWalletConnectButtons = async (page) => {
  return page.evaluate(() => {
    const keywords = ['connect wallet', 'connect', 'metamask', 'walletconnect', 'coinbase wallet', 'rainbow'];
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
    return buttons
      .filter(b => keywords.some(k => (b.textContent || '').toLowerCase().includes(k)))
      .map(b => {
        const rect = b.getBoundingClientRect();
        return { text: b.textContent.trim(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });
  });
};

module.exports = { detectInteractiveElements, detectWalletConnectButtons };
