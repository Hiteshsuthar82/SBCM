const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -otp -otpExpiry')
      .lean();
      
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Add computed fields
    const profile = {
      ...user,
      memberSince: user.createdAt,
      lastActive: user.updatedAt,
    };
    
    return successResponse(res, profile);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Update user profile
router.put('/', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address, dateOfBirth, gender } = req.body;
    
    const updateData = {};
    
    // Only update provided fields
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    
    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = req.file.path;
    }
    
    updateData.updatedAt = new Date();
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');
    
    if (!updatedUser) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Update profile picture only
router.post('/picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file provided', 400);
    }
    
    const userId = req.user.id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profilePicture: req.file.path,
        updatedAt: new Date()
      },
      { new: true }
    ).select('profilePicture name');
    
    if (!updatedUser) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, {
      profilePicture: updatedUser.profilePicture,
      name: updatedUser.name
    }, 'Profile picture updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Delete profile picture
router.delete('/picture', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $unset: { profilePicture: 1 },
        updatedAt: new Date()
      },
      { new: true }
    ).select('name');
    
    if (!updatedUser) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, { name: updatedUser.name }, 'Profile picture removed successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// Get profile statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Import models here to avoid circular dependency
    const Complaint = require('../models/Complaint');
    const Withdrawal = require('../models/Withdrawal');
    
    const user = await User.findById(userId).select('points createdAt');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Get complaint statistics
    const complaintStats = await Complaint.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);
    
    // Get withdrawal statistics
    const withdrawalStats = await Withdrawal.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);
    
    // Format statistics
    const complaints = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalPointsEarned: 0
    };
    
    const withdrawals = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      totalPointsSpent: 0
    };
    
    complaintStats.forEach(stat => {
      complaints.total += stat.count;
      complaints[stat._id] = stat.count;
      if (stat._id === 'approved') {
        complaints.totalPointsEarned += stat.totalPoints || 0;
      }
    });
    
    withdrawalStats.forEach(stat => {
      withdrawals.total += stat.count;
      withdrawals[stat._id] = stat.count;
      if (['approved', 'completed'].includes(stat._id)) {
        withdrawals.totalPointsSpent += stat.totalPoints || 0;
      }
    });
    
    const stats = {
      currentPoints: user.points,
      memberSince: user.createdAt,
      complaints,
      withdrawals,
      summary: {
        totalPointsEarned: complaints.totalPointsEarned,
        totalPointsSpent: withdrawals.totalPointsSpent,
        netPoints: complaints.totalPointsEarned - withdrawals.totalPointsSpent,
        currentBalance: user.points
      }
    };
    
    return successResponse(res, stats);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;