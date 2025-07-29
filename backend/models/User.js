const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true, match: /^[0-9]{10}$/ },
  email: { type: String, unique: true, sparse: true },
  address: { type: String },
  aadhaar: { type: String, match: /^[0-9]{12}$/ },
  profession: { type: String },
  language: { type: String, default: 'en' },
  photo: { type: String },
  points: { type: Number, default: 0 },
  paymentDetails: {
    upiId: { type: String },
    bankAccount: { type: String },
    ifsc: { type: String },
  },
  progress: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  fcmTokens: [{
    token: { type: String },
    platform: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ mobile: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);