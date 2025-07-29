const ActionHistory = require('../models/ActionHistory');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { sendNotificationToUser, sendNotificationToRole, sendBroadcastNotification } = require('../utils/notificationUtil');

// Model for storing notification history
const mongoose = require('mongoose');

const notificationHistorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: { type: String, enum: ['all', 'active', 'inactive', 'specific'], required: true },
  specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  actionUrl: { type: String },
  scheduleTime: { type: Date },
  status: { type: String, enum: ['sent', 'scheduled', 'failed', 'draft'], default: 'sent' },
  sentAt: { type: Date },
  recipientCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
});

const NotificationHistory = mongoose.model('NotificationHistory', notificationHistorySchema);

const notificationTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, required: true },
  variables: [{ type: String }], // Variables like {route_number}, {date}, etc.
  usageCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
});

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);

const sendNotification = async (req, res) => {
  const { title, message, audience, specificUsers, priority, actionUrl, scheduleTime } = req.body;
  
  try {
    let recipientCount = 0;
    let deliveredCount = 0;
    let status = 'sent';
    let sentAt = new Date();

    // If scheduled for future, mark as scheduled
    if (scheduleTime && new Date(scheduleTime) > new Date()) {
      status = 'scheduled';
      sentAt = new Date(scheduleTime);
    } else {
      // Send notification immediately
      try {
        if (audience === 'all') {
          const users = await User.find({ isActive: true });
          recipientCount = users.length;
          await sendBroadcastNotification(title, message, { actionUrl });
          deliveredCount = recipientCount; // Assume all delivered for now
        } else if (audience === 'active') {
          const users = await User.find({ isActive: true, lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
          recipientCount = users.length;
          await sendBroadcastNotification(title, message, { actionUrl });
          deliveredCount = recipientCount;
        } else if (audience === 'inactive') {
          const users = await User.find({ 
            isActive: true, 
            lastActivity: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
          });
          recipientCount = users.length;
          await sendBroadcastNotification(title, message, { actionUrl });
          deliveredCount = recipientCount;
        } else if (audience === 'specific' && specificUsers && specificUsers.length > 0) {
          recipientCount = specificUsers.length;
          for (const userId of specificUsers) {
            await sendNotificationToUser(userId, title, message, { actionUrl });
          }
          deliveredCount = recipientCount;
        }
      } catch (notificationError) {
        console.error('Notification sending failed:', notificationError);
        status = 'failed';
        deliveredCount = 0;
      }
    }

    // Save notification history
    const notificationRecord = new NotificationHistory({
      title,
      message,
      audience,
      specificUsers: audience === 'specific' ? specificUsers : undefined,
      priority,
      actionUrl,
      scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
      status,
      sentAt,
      recipientCount,
      deliveredCount,
      createdBy: req.user.id,
    });

    await notificationRecord.save();

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: status === 'scheduled' ? 'schedule' : 'send',
      resource: 'notification',
      resourceId: notificationRecord._id,
      details: `${status === 'scheduled' ? 'Scheduled' : 'Sent'} notification: ${title} to ${audience} audience`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, notificationRecord);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getNotificationHistory = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const notifications = await NotificationHistory.find()
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await NotificationHistory.countDocuments();
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, notifications, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getNotificationTemplates = async (req, res) => {
  try {
    const templates = await NotificationTemplate.find()
      .populate('createdBy', 'name email')
      .sort({ usageCount: -1, createdAt: -1 });

    return successResponse(res, templates);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createNotificationTemplate = async (req, res) => {
  const { name, title, message, category, variables } = req.body;
  
  try {
    const template = new NotificationTemplate({
      name,
      title,
      message,
      category,
      variables,
      createdBy: req.user.id,
    });

    await template.save();

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'create',
      resource: 'notification_template',
      resourceId: template._id,
      details: `Created notification template: ${name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, template);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateNotificationTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, title, message, category, variables } = req.body;
  
  try {
    const template = await NotificationTemplate.findByIdAndUpdate(
      id,
      { name, title, message, category, variables },
      { new: true }
    );

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'update',
      resource: 'notification_template',
      resourceId: template._id,
      details: `Updated notification template: ${name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, template);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteNotificationTemplate = async (req, res) => {
  const { id } = req.params;
  
  try {
    const template = await NotificationTemplate.findById(id);
    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    const templateName = template.name;
    await NotificationTemplate.findByIdAndDelete(id);

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'delete',
      resource: 'notification_template',
      resourceId: id,
      details: `Deleted notification template: ${templateName}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, { message: 'Template deleted successfully' });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  sendNotification,
  getNotificationHistory,
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate
};