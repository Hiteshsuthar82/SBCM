const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { getComplaintAnalytics, getUserAnalytics, getWithdrawalAnalytics } = require('../services/analyticsService');

const getDashboard = async (req, res) => {
  const { timeRange = '7d' } = req.query;
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;
  try {
    const complaints = await getComplaintAnalytics(days);
    const users = await getUserAnalytics(days);
    const withdrawals = await getWithdrawalAnalytics(days);
    const system = { uptime: process.uptime(), responseTime: 100, errorRate: 0, performanceScore: 95 }; // Mock; use real metrics
    return successResponse(res, { complaints, users, system, withdrawals });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getComplaintsAnalytics = async (req, res) => {
  const { timeRange = '30d' } = req.query;
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
  
  try {
    const analytics = await getComplaintAnalytics(days);
    return successResponse(res, analytics);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getUsersAnalytics = async (req, res) => {
  const { timeRange = '30d' } = req.query;
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
  
  try {
    const analytics = await getUserAnalytics(days);
    return successResponse(res, analytics);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getSystemAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    const systemMetrics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        resolved: totalComplaints - pendingComplaints
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
        processed: totalWithdrawals - pendingWithdrawals
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    return successResponse(res, systemMetrics);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getEngagementAnalytics = async (req, res) => {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyActiveUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const weeklyActiveUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const monthlyActiveUsers = await User.countDocuments({
      lastLogin: { $gte: last30Days }
    });

    const engagementMetrics = {
      activeUsers: {
        daily: dailyActiveUsers,
        weekly: weeklyActiveUsers,
        monthly: monthlyActiveUsers
      },
      averageSessionTime: 15, // Mock data - implement real session tracking
      bounceRate: 25, // Mock data
      retentionRate: 75 // Mock data
    };

    return successResponse(res, engagementMetrics);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const exportReport = async (req, res) => {
  const { type } = req.params;
  const { timeRange = '30d' } = req.query;
  
  try {
    let reportData;
    
    switch (type) {
      case 'complaints':
        reportData = await getComplaintAnalytics(30);
        break;
      case 'users':
        reportData = await getUserAnalytics(30);
        break;
      case 'system':
        reportData = await getSystemAnalytics();
        break;
      default:
        return errorResponse(res, 'Invalid report type', 400);
    }

    // In a real implementation, you would generate CSV/PDF file
    const exportData = {
      type,
      timeRange,
      data: reportData,
      exportedAt: new Date(),
      downloadUrl: `/exports/${type}-${Date.now()}.csv`
    };

    return successResponse(res, exportData, 'Report exported successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { 
  getDashboard, 
  getComplaintsAnalytics, 
  getUsersAnalytics, 
  getSystemAnalytics, 
  getEngagementAnalytics, 
  exportReport 
};