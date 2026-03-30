const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  googleId: { type: String, sparse: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  profilePicture: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  subscriptionTier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  lastLogin: { type: Date },
  preferences: {
    defaultLanguage: { type: String, default: 'en' },
    defaultVoiceType: { type: String, default: 'female' },
    defaultVoiceStyle: { type: String, default: 'professional' },
    defaultOutputType: { type: String, enum: ['video', 'image', 'both'], default: 'video' },
  },
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  if (!this.passwordHash.startsWith('$2b$')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
