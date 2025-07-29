const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, required: true },
  target: { type: String },
  action: {
    text: { type: String },
    href: { type: String },
  },
});

const completionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  completedAt: { type: Date, default: Date.now },
});

const quickTourSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  targetRoles: [{ type: String, required: true }],
  enabled: { type: Boolean, default: true },
  steps: [stepSchema],
  completions: [completionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuickTour', quickTourSchema);