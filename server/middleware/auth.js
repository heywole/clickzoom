const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-passwordHash -emailVerificationToken -passwordResetToken');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.userId).select('-passwordHash');
    }
  } catch {}
  next();
};

const requirePro = (req, res, next) => {
  if (!req.user || req.user.subscriptionTier === 'free') {
    return res.status(403).json({ message: 'This feature requires a Pro subscription' });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requirePro };
