const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  route: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

busStopSchema.index({ code: 1 });
busStopSchema.index({ route: 1 });

module.exports = mongoose.model('BusStop', busStopSchema);