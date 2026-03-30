const crypto = require('crypto');
const url = require('url');

const generateToken = (length = 32) => crypto.randomBytes(length).toString('hex');

const createUrlFingerprint = (targetUrl) => {
  try {
    const parsed = new url.URL(targetUrl);
    const normalized = parsed.hostname + parsed.pathname;
    return crypto.createHash('sha256').update(normalized.toLowerCase()).digest('hex');
  } catch {
    return crypto.createHash('sha256').update(targetUrl).digest('hex');
  }
};

const paginate = (page = 1, limit = 10) => ({
  skip: (parseInt(page) - 1) * parseInt(limit),
  limit: parseInt(limit),
});

const sanitizeString = (str) => {
  if (!str) return '';
  return str.replace(/[<>]/g, '').trim();
};

module.exports = { generateToken, createUrlFingerprint, paginate, sanitizeString };
