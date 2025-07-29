const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  action: { type: String, required: true },
  status: { type: String, required: true },
  reason: { type: String },
  description: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  adminName: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  method: { type: String, required: true, enum: ['UPI', 'Bank Transfer'] },
  status: { type: String, enum: ['pending', 'processing', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String },
  description: { type: String },
  paymentDetails: {
    upiId: { type: String },
    bankAccount: { type: String },
    ifsc: { type: String },
    accountHolderName: { type: String },
  },
  timeline: [timelineSchema],
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);