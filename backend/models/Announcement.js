const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  route: { type: String },
  scheduledAt: { type: Date },
  isActive: { type: Boolean, default: true },
  likes: [likeSchema],
  dislikes: [likeSchema],
  views: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ route: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);