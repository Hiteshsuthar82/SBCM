const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Withdrawal = require('../models/Withdrawal');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { mobile: { $regex: search } }];
  if (status !== 'all') filter.isActive = status === 'active';
  try {
    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    const pagination = { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) };
    // Add stats for each user
    const withStats = await Promise.all(users.map(async u => {
      const totalComplaints = await Complaint.countDocuments({ userId: u._id });
      const approvedComplaints = await Complaint.countDocuments({ userId: u._id, status: 'approved' });
      const totalWithdrawals = await Withdrawal.countDocuments({ userId: u._id });
      return { ...u.toJSON(), stats: { totalComplaints, approvedComplaints, totalPoints: u.points, totalWithdrawals, joinDate: u.createdAt } };
    }));
    return successResponse(res, withStats, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return errorResponse(res, 'User not found', 404);
    const totalComplaints = await Complaint.countDocuments({ userId: id });
    const approvedComplaints = await Complaint.countDocuments({ userId: id, status: 'approved' });
    const totalWithdrawals = await Withdrawal.countDocuments({ userId: id });
    const stats = { totalComplaints, approvedComplaints, totalPoints: user.points, totalWithdrawals, joinDate: user.createdAt };
    return successResponse(res, { user, stats });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, address, profession, language } = req.body;
  
  try {
    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (profession) updateData.profession = profession;
    if (language) updateData.language = language;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const activateUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User activated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deactivateUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User deactivated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, null, 'User deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getUsers, getUserById, updateUser, activateUser, deactivateUser, deleteUser };