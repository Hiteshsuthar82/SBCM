const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Withdrawal = require('../models/Withdrawal');
const ActionHistory = require('../models/ActionHistory');
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
      
      // Determine user status based on isActive and recent activity
      let userStatus = 'inactive';
      if (u.isActive) {
        const lastActivity = u.lastActivity || u.updatedAt || u.createdAt;
        const daysSinceActivity = (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
        userStatus = daysSinceActivity <= 7 ? 'active' : 'inactive';
      } else {
        userStatus = 'suspended';
      }
      
      return { 
        ...u.toJSON(), 
        stats: { 
          totalComplaints, 
          approvedComplaints, 
          totalPoints: u.points, 
          totalWithdrawals, 
          joinDate: u.createdAt,
          lastActivity: u.lastActivity || u.updatedAt || u.createdAt,
          status: userStatus
        } 
      };
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
  const { name, email, address, profession, language, status } = req.body;
  
  try {
    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (profession) updateData.profession = profession;
    if (language) updateData.language = language;
    
    // Handle status updates
    if (status !== undefined) {
      if (status === 'suspended') {
        updateData.isActive = false;
      } else if (status === 'active') {
        updateData.isActive = true;
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'update',
      resource: 'user',
      resourceId: user._id,
      details: `Updated user: ${user.name} (${user.email})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

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

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'activate',
      resource: 'user',
      resourceId: user._id,
      details: `Activated user: ${user.name} (${user.email})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

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

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'deactivate',
      resource: 'user',
      resourceId: user._id,
      details: `Deactivated user: ${user.name} (${user.email})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

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