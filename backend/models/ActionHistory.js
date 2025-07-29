const mongoose = require('mongoose');

const actionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

actionHistorySchema.index({ createdAt: -1 });
actionHistorySchema.index({ adminId: 1 });
actionHistorySchema.index({ userId: 1 });

module.exports = mongoose.model('ActionHistory', actionHistorySchema);