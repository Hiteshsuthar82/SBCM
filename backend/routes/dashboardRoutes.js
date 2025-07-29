const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Withdrawal = require('../models/Withdrawal');
const Announcement = require('../models/Announcement');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// Get user dashboard stats
router.get('/user-stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's complaints
    const userComplaints = await Complaint.find({ userId });
    const approvedComplaints = userComplaints.filter(c => c.status === 'approved');
    
    // Get user's withdrawals
    const userWithdrawals = await Withdrawal.find({ userId });
    const approvedWithdrawals = userWithdrawals.filter(w => w.status === 'approved');
    
    // Get user's points
    const user = await User.findById(userId);
    
    const stats = {
      totalComplaints: userComplaints.length,
      approvedComplaints: approvedComplaints.length,
      pendingComplaints: userComplaints.filter(c => c.status === 'pending').length,
      totalPoints: user?.points || 0,
      totalWithdrawals: userWithdrawals.length,
      approvedWithdrawals: approvedWithdrawals.length,
      pendingWithdrawals: userWithdrawals.filter(w => w.status === 'pending').length,
      totalWithdrawnPoints: approvedWithdrawals.reduce((sum, w) => sum + w.points, 0),
    };
    
    return successResponse(res, stats);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Get admin dashboard stats
router.get('/admin-stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const totalWithdrawals = await Withdrawal.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();
    
    // Today's counts
    const todayComplaints = await Complaint.countDocuments({ 
      createdAt: { $gte: startOfDay } 
    });
    const todayUsers = await User.countDocuments({ 
      createdAt: { $gte: startOfDay } 
    });
    const todayWithdrawals = await Withdrawal.countDocuments({ 
      createdAt: { $gte: startOfDay } 
    });
    
    // Weekly counts
    const weeklyComplaints = await Complaint.countDocuments({ 
      createdAt: { $gte: startOfWeek } 
    });
    const weeklyUsers = await User.countDocuments({ 
      createdAt: { $gte: startOfWeek } 
    });
    
    // Monthly counts
    const monthlyComplaints = await Complaint.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });
    const monthlyUsers = await User.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });
    
    // Status-based counts
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const approvedComplaints = await Complaint.countDocuments({ status: 'approved' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'rejected' });
    
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });
    const rejectedWithdrawals = await Withdrawal.countDocuments({ status: 'rejected' });
    
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    // Recent activity
    const recentComplaints = await Complaint.find()
      .populate('userId', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentWithdrawals = await Withdrawal.find()
      .populate('userId', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const stats = {
      overview: {
        totalUsers,
        totalComplaints,
        totalWithdrawals,
        totalAnnouncements,
      },
      today: {
        complaints: todayComplaints,
        users: todayUsers,
        withdrawals: todayWithdrawals,
      },
      weekly: {
        complaints: weeklyComplaints,
        users: weeklyUsers,
      },
      monthly: {
        complaints: monthlyComplaints,
        users: monthlyUsers,
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        approved: approvedComplaints,
        rejected: rejectedComplaints,
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
        approved: approvedWithdrawals,
        rejected: rejectedWithdrawals,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      recent: {
        complaints: recentComplaints,
        withdrawals: recentWithdrawals,
      },
    };
    
    return successResponse(res, stats);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;