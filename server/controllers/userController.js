const User = require('../models/User');

exports.getProfile = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;
    const user = await User.findById(req.user._id);
    if (firstName) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { defaultLanguage, defaultVoiceType, defaultVoiceStyle, defaultOutputType } = req.body;
    const user = await User.findById(req.user._id);
    if (defaultLanguage) user.preferences.defaultLanguage = defaultLanguage;
    if (defaultVoiceType) user.preferences.defaultVoiceType = defaultVoiceType;
    if (defaultVoiceStyle) user.preferences.defaultVoiceStyle = defaultVoiceStyle;
    if (defaultOutputType) user.preferences.defaultOutputType = defaultOutputType;
    await user.save();
    res.json({ preferences: user.preferences });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('refreshToken');
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};
