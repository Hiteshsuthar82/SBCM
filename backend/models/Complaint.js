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

const complaintSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  stop: { type: String, required: true },
  dateTime: { type: Date },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
  },
  evidence: [{ type: String }],
  status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String },
  adminDescription: { type: String },
  timeline: [timelineSchema],
  points: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  isAnonymous: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dynamicFields: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

complaintSchema.index({ token: 1 });
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);