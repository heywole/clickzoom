const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { generateToken } = require('../utils/helpers');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const verificationToken = generateToken();
    const user = await User.create({
      firstName, lastName,
      email: email.toLowerCase(),
      passwordHash: password,
      emailVerificationToken: verificationToken,
    });

    await sendVerificationEmail(user.email, verificationToken).catch(() => {});
    res.status(201).json({ message: 'Account created. Please check your email to verify.' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({ accessToken, refreshToken, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
  } catch {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken || req.headers['x-refresh-token'];
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const accessToken = generateAccessToken(user._id);
    const newRefresh = generateRefreshToken(user._id);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired, please login again' });
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ emailVerificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });
    const token = generateToken();
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordResetEmail(user.email, token).catch(() => {});
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    user.passwordHash = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
