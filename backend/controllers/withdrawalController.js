const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { redeemPoints } = require('../services/pointsService');

const createWithdrawal = async (req, res) => {
  const { points, method, paymentDetails } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.points < points) return errorResponse(res, 'Insufficient points', 400);
    if (points < require('../config/config').points.minWithdrawal) return errorResponse(res, 'Minimum withdrawal not met', 400);
    const withdrawal = new Withdrawal({
      userId: req.user.id,
      points,
      method,
      paymentDetails,
    });
    await withdrawal.save();
    await redeemPoints(req.user.id, points, 'withdrawal', withdrawal._id);
    // Notify admin
    global.io.emit('newWithdrawal', { id: withdrawal._id });
    return successResponse(res, { id: withdrawal._id, status: withdrawal.status, estimatedProcessingTime: '3-5 days' });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getWithdrawals = async (req, res) => {
  const { page = 1, limit = 10, status = 'all', userId = 'all' } = req.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (userId !== 'all') filter.userId = userId;
  try {
    const withdrawals = await Withdrawal.find(filter)
      .populate('userId', 'name mobile')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Withdrawal.countDocuments(filter);
    const pagination = { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) };
    return successResponse(res, withdrawals, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const approveWithdrawal = async (req, res) => {
  const { id } = req.params;
  const { status, reason, description, transactionId } = req.body;
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return errorResponse(res, 'Withdrawal not found', 404);
    withdrawal.status = status;
    withdrawal.reason = reason;
    withdrawal.description = description;
    withdrawal.transactionId = transactionId;
    withdrawal.processedBy = req.user.id;
    withdrawal.timeline.push({
      action: 'status_update',
      status,
      reason,
      description,
      adminId: req.user.id,
      adminName: req.user.name || 'Admin', // Assume admin has name
      timestamp: new Date(),
    });
    await withdrawal.save();
    // Notify user
    const user = await User.findById(withdrawal.userId);
    user.fcmTokens.forEach(({ token }) => require('../utils/notificationUtil').sendNotification(token, 'Withdrawal Update', `Your withdrawal is now ${status}`));
    global.io.to(withdrawal.userId.toString()).emit('withdrawalUpdate', withdrawal);
    return successResponse(res, withdrawal);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { createWithdrawal, getWithdrawals, approveWithdrawal };