const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getReports = async (req, res) => {
  try {
    // For now, return available report types
    const reportTypes = [
      {
        id: 'complaints',
        name: 'Complaints Report',
        description: 'Detailed report of all complaints',
        fields: ['status', 'type', 'dateRange', 'busStop']
      },
      {
        id: 'users',
        name: 'Users Report',
        description: 'User activity and statistics report',
        fields: ['registrationDate', 'status', 'pointsRange']
      },
      {
        id: 'withdrawals',
        name: 'Withdrawals Report',
        description: 'Points withdrawal requests report',
        fields: ['status', 'dateRange', 'amountRange']
      },
      {
        id: 'analytics',
        name: 'Analytics Report',
        description: 'System analytics and performance report',
        fields: ['dateRange', 'metrics']
      }
    ];

    return successResponse(res, reportTypes);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const generateReport = async (req, res) => {
  const { type, dateRange, filters } = req.body;
  
  try {
    let reportData = {};
    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    switch (type) {
      case 'complaints':
        reportData = await generateComplaintsReport(startDate, endDate, filters);
        break;
      case 'users':
        reportData = await generateUsersReport(startDate, endDate, filters);
        break;
      case 'withdrawals':
        reportData = await generateWithdrawalsReport(startDate, endDate, filters);
        break;
      case 'analytics':
        reportData = await generateAnalyticsReport(startDate, endDate, filters);
        break;
      default:
        return errorResponse(res, 'Invalid report type', 400);
    }

    const report = {
      id: Date.now().toString(),
      type,
      dateRange: { start: startDate, end: endDate },
      filters,
      data: reportData,
      generatedAt: new Date(),
      generatedBy: req.user.id
    };

    return successResponse(res, report, 'Report generated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const downloadReport = async (req, res) => {
  const { id } = req.params;
  
  try {
    // In a real implementation, you would retrieve the report from database
    // and return it as a downloadable file (CSV, PDF, etc.)
    
    return successResponse(res, { 
      downloadUrl: `/reports/${id}/file`,
      message: 'Report download link generated' 
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const scheduleReport = async (req, res) => {
  const { type, frequency, recipients } = req.body;
  
  try {
    // In a real implementation, you would save this to a scheduled reports collection
    // and set up a cron job to generate and email reports
    
    const scheduledReport = {
      id: Date.now().toString(),
      type,
      frequency,
      recipients,
      createdBy: req.user.id,
      createdAt: new Date(),
      nextRun: calculateNextRun(frequency)
    };

    return successResponse(res, scheduledReport, 'Report scheduled successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Helper functions for generating different types of reports
const generateComplaintsReport = async (startDate, endDate, filters) => {
  const filter = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (filters?.status) filter.status = filters.status;
  if (filters?.type) filter.type = filters.type;
  if (filters?.busStop) filter.stop = filters.busStop;

  const complaints = await Complaint.find(filter)
    .populate('userId', 'name mobile')
    .sort({ createdAt: -1 });

  const summary = {
    total: complaints.length,
    byStatus: await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    byType: await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
  };

  return { complaints, summary };
};

const generateUsersReport = async (startDate, endDate, filters) => {
  const filter = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (filters?.status) filter.isActive = filters.status === 'active';

  const users = await User.find(filter).sort({ createdAt: -1 });
  
  const summary = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    totalPoints: users.reduce((sum, u) => sum + u.points, 0)
  };

  return { users, summary };
};

const generateWithdrawalsReport = async (startDate, endDate, filters) => {
  const filter = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (filters?.status) filter.status = filters.status;

  const withdrawals = await Withdrawal.find(filter)
    .populate('userId', 'name mobile')
    .sort({ createdAt: -1 });

  const summary = {
    total: withdrawals.length,
    totalPoints: withdrawals.reduce((sum, w) => sum + w.points, 0),
    byStatus: await Withdrawal.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, totalPoints: { $sum: '$points' } } }
    ])
  };

  return { withdrawals, summary };
};

const generateAnalyticsReport = async (startDate, endDate, filters) => {
  const complaintsCount = await Complaint.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  const usersCount = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  const withdrawalsCount = await Withdrawal.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  return {
    period: { start: startDate, end: endDate },
    metrics: {
      newComplaints: complaintsCount,
      newUsers: usersCount,
      withdrawalRequests: withdrawalsCount
    }
  };
};

const calculateNextRun = (frequency) => {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
};

module.exports = {
  getReports,
  generateReport,
  downloadReport,
  scheduleReport
};