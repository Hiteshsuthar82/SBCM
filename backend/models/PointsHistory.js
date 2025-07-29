const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['earned', 'redeemed', 'adjusted'] },
  points: { type: Number, required: true },
  description: { type: String, required: true },
  source: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});

pointsHistorySchema.index({ userId: 1 });
pointsHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('PointsHistory', pointsHistorySchema);