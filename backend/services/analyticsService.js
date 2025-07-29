const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

const getComplaintAnalytics = async (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const total = await Complaint.countDocuments();
  const pending = await Complaint.countDocuments({ status: 'pending' });
  const approved = await Complaint.countDocuments({ status: 'approved' });
  const rejected = await Complaint.countDocuments({ status: 'rejected' });
  const dailyTrend = await Complaint.aggregate([
    { $match: { createdAt: { $gte: date } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const categoryBreakdown = await Complaint.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  return { total, pending, approved, rejected, dailyTrend, categoryBreakdown };
};

const getUserAnalytics = async (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const total = await User.countDocuments();
  const active = await User.countDocuments({ isActive: true });
  const newThisMonth = await User.countDocuments({ createdAt: { $gte: date } });
  const retention = 80; // Mock calculation
  const deviceBreakdown = await User.aggregate([
    { $unwind: '$fcmTokens' },
    { $group: { _id: '$fcmTokens.platform', count: { $sum: 1 } } },
  ]);
  return { total, active, newThisMonth, retention, deviceBreakdown };
};

const getWithdrawalAnalytics = async (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const total = await Withdrawal.countDocuments();
  const amount = await Withdrawal.aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$points' } } },
  ]).then(res => res[0]?.totalAmount || 0);
  const pending = await Withdrawal.countDocuments({ status: 'pending' });
  const approved = await Withdrawal.countDocuments({ status: 'approved' });
  return { total, amount, pending, approved };
};

module.exports = { getComplaintAnalytics, getUserAnalytics, getWithdrawalAnalytics };