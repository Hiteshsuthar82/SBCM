const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// Get leaderboard
router.get('/', verifyToken, async (req, res) => {
  try {
    const { timeFrame = 'all', category = 'points', limit = 50 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    // Set date filter based on timeFrame
    switch (timeFrame) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'week':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
        };
        break;
      default:
        // 'all' - no date filter
        break;
    }
    
    let leaderboard = [];
    
    if (category === 'points') {
      // Points-based leaderboard
      leaderboard = await User.find({ isActive: true })
        .select('name mobile points profilePicture createdAt')
        .sort({ points: -1 })
        .limit(parseInt(limit));
        
      leaderboard = leaderboard.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
        profilePicture: user.profilePicture,
        points: user.points,
        joinedAt: user.createdAt,
      }));
      
    } else if (category === 'complaints') {
      // Complaints-based leaderboard
      const complaintStats = await Complaint.aggregate([
        { $match: { status: 'approved', ...dateFilter } },
        {
          $group: {
            _id: '$userId',
            totalComplaints: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        },
        { $sort: { totalComplaints: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: {
            'user.isActive': true
          }
        }
      ]);
      
      leaderboard = complaintStats.map((stat, index) => ({
        rank: index + 1,
        userId: stat._id,
        name: stat.user.name,
        mobile: stat.user.mobile,
        profilePicture: stat.user.profilePicture,
        totalComplaints: stat.totalComplaints,
        totalPoints: stat.totalPoints,
        joinedAt: stat.user.createdAt,
      }));
      
    } else if (category === 'recent') {
      // Most recent active users
      leaderboard = await User.find({ isActive: true, ...dateFilter })
        .select('name mobile points profilePicture createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
        
      leaderboard = leaderboard.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
        profilePicture: user.profilePicture,
        points: user.points,
        joinedAt: user.createdAt,
      }));
    }
    
    // Get current user's position if authenticated
    let currentUserRank = null;
    if (req.user && req.user.id) {
      if (category === 'points') {
        const currentUser = await User.findById(req.user.id);
        if (currentUser) {
          const usersAbove = await User.countDocuments({
            points: { $gt: currentUser.points },
            isActive: true
          });
          currentUserRank = {
            rank: usersAbove + 1,
            points: currentUser.points,
            name: currentUser.name,
          };
        }
      } else if (category === 'complaints') {
        const userComplaintCount = await Complaint.countDocuments({
          userId: req.user.id,
          status: 'approved',
          ...dateFilter
        });
        
        const usersAbove = await Complaint.aggregate([
          { $match: { status: 'approved', ...dateFilter } },
          {
            $group: {
              _id: '$userId',
              totalComplaints: { $sum: 1 }
            }
          },
          {
            $match: {
              totalComplaints: { $gt: userComplaintCount }
            }
          },
          { $count: 'count' }
        ]);
        
        currentUserRank = {
          rank: (usersAbove[0]?.count || 0) + 1,
          totalComplaints: userComplaintCount,
        };
      }
    }
    
    const response = {
      leaderboard,
      currentUserRank,
      metadata: {
        timeFrame,
        category,
        total: leaderboard.length,
        generatedAt: new Date(),
      }
    };
    
    return successResponse(res, response);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;