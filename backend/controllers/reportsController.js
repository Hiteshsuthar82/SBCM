const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const ActionHistory = require('../models/ActionHistory');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const mongoose = require('mongoose');

// Model for storing generated reports
const reportHistorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  format: { type: String, required: true },
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
  dateRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  filters: { type: mongoose.Schema.Types.Mixed },
  recordCount: { type: Number, default: 0 },
  fileSize: { type: String },
  downloadUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const ReportHistory = mongoose.model('ReportHistory', reportHistorySchema);

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
  const { type, format, dateRange, filters } = req.body;
  
  try {
    const startDate = dateRange?.from ? new Date(dateRange.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();

    // Create report record
    const reportRecord = new ReportHistory({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${startDate.toLocaleDateString()}`,
      type,
      format: format || 'excel',
      dateRange: { from: startDate, to: endDate },
      filters,
      createdBy: req.user.id,
    });

    await reportRecord.save();

    // Generate report data
    let reportData = {};
    let recordCount = 0;

    switch (type) {
      case 'complaints':
        reportData = await generateComplaintsReport(startDate, endDate, filters);
        recordCount = reportData.complaints?.length || 0;
        break;
      case 'users':
        reportData = await generateUsersReport(startDate, endDate, filters);
        recordCount = reportData.users?.length || 0;
        break;
      case 'withdrawals':
        reportData = await generateWithdrawalsReport(startDate, endDate, filters);
        recordCount = reportData.withdrawals?.length || 0;
        break;
      case 'analytics':
        reportData = await generateAnalyticsReport(startDate, endDate, filters);
        recordCount = Object.keys(reportData.metrics || {}).length;
        break;
      default:
        return errorResponse(res, 'Invalid report type', 400);
    }

    // Update report record with completion details
    reportRecord.status = 'completed';
    reportRecord.recordCount = recordCount;
    reportRecord.fileSize = `${(Math.random() * 5 + 0.5).toFixed(1)} MB`; // Mock file size
    reportRecord.downloadUrl = `/reports/${reportRecord._id}/download`;
    reportRecord.completedAt = new Date();
    await reportRecord.save();

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'generate',
      resource: 'report',
      resourceId: reportRecord._id,
      details: `Generated ${type} report for period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, reportRecord, 'Report generated successfully');
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

const getReportHistory = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const reports = await ReportHistory.find()
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ReportHistory.countDocuments();
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, reports, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getReports,
  generateReport,
  downloadReport,
  scheduleReport,
  getReportHistory
};