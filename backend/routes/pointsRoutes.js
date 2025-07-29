const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Withdrawal = require('../models/Withdrawal');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// Get user's current points balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, { 
      balance: user.points,
      userId: req.user.id 
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Get user's points history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    // Get complaints that earned points
    const complaints = await Complaint.find({ 
      userId, 
      status: 'approved',
      points: { $gt: 0 }
    })
    .select('title points createdAt approvedAt')
    .sort({ approvedAt: -1 });
    
    // Get withdrawals that deducted points
    const withdrawals = await Withdrawal.find({ 
      userId,
      status: { $in: ['approved', 'completed'] }
    })
    .select('points method status createdAt approvedAt')
    .sort({ approvedAt: -1 });
    
    // Combine and format history
    const history = [];
    
    // Add complaint earnings
    complaints.forEach(complaint => {
      history.push({
        id: complaint._id,
        type: 'earned',
        source: 'complaint',
        title: `Complaint: ${complaint.title}`,
        points: complaint.points,
        date: complaint.approvedAt || complaint.createdAt,
        description: `Points earned for approved complaint`,
      });
    });
    
    // Add withdrawal deductions
    withdrawals.forEach(withdrawal => {
      history.push({
        id: withdrawal._id,
        type: 'spent',
        source: 'withdrawal',
        title: `Withdrawal via ${withdrawal.method}`,
        points: -withdrawal.points,
        date: withdrawal.approvedAt || withdrawal.createdAt,
        description: `Points withdrawn via ${withdrawal.method}`,
        status: withdrawal.status,
      });
    });
    
    // Sort by date (most recent first)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = history.slice(startIndex, endIndex);
    
    // Calculate running balance
    let runningBalance = 0;
    const user = await User.findById(userId).select('points');
    runningBalance = user.points;
    
    // Add running balance to each entry (working backwards)
    for (let i = paginatedHistory.length - 1; i >= 0; i--) {
      paginatedHistory[i].balanceAfter = runningBalance;
      runningBalance -= paginatedHistory[i].points;
      paginatedHistory[i].balanceBefore = runningBalance;
    }
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: history.length,
      totalPages: Math.ceil(history.length / limit)
    };
    
    return successResponse(res, paginatedHistory, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Get points summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current balance
    const user = await User.findById(userId).select('points');
    
    // Get total earned from complaints
    const totalEarned = await Complaint.aggregate([
      { 
        $match: { 
          userId: userId, 
          status: 'approved',
          points: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total spent on withdrawals
    const totalSpent = await Withdrawal.aggregate([
      { 
        $match: { 
          userId: userId, 
          status: { $in: ['approved', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get pending withdrawals
    const pendingWithdrawals = await Withdrawal.aggregate([
      { 
        $match: { 
          userId: userId, 
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const summary = {
      currentBalance: user?.points || 0,
      totalEarned: totalEarned[0]?.total || 0,
      totalSpent: totalSpent[0]?.total || 0,
      pendingWithdrawals: pendingWithdrawals[0]?.total || 0,
      totalComplaints: totalEarned[0]?.count || 0,
      totalWithdrawals: totalSpent[0]?.count || 0,
      pendingWithdrawalCount: pendingWithdrawals[0]?.count || 0,
    };
    
    return successResponse(res, summary);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;