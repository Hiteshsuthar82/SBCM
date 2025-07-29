const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    // createIndexes();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const createIndexes = async () => {
  // User: unique indexes on mobile and email are auto-created by Mongoose

  const Complaint = require('../models/Complaint');
  await Complaint.syncIndexes();

  const Withdrawal = require('../models/Withdrawal');
  await Withdrawal.syncIndexes();

  const Announcement = require('../models/Announcement');
  await Announcement.syncIndexes();

  const BusStop = require('../models/BusStop');
  await BusStop.syncIndexes();

  const ActionHistory = require('../models/ActionHistory');
  await ActionHistory.syncIndexes();

  const PointsHistory = require('../models/PointsHistory');
  await PointsHistory.syncIndexes();

  // Admin: email unique auto-created, do not include manual index
  // Rule: no indexes
  // SystemConfig: key unique auto-created, do not include manual index
  // QuickTour: no indexes
  // Role: name unique auto-created, do not include manual index
};
// ...existing code...

module.exports = { connect };