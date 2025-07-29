const User = require('../models/User');
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { sendNotification } = require('../utils/notificationUtil');

const updateToken = async (req, res) => {
  const { token, platform } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.fcmTokens.some(t => t.token === token)) {
      user.fcmTokens.push({ token, platform, createdAt: new Date() });
      await user.save();
    }
    return successResponse(res, null, 'Token updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const sendToUser = async (req, res) => {
  const { userId, title, body, data } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'User not found', 404);
    let sent = false;
    for (const fcm of user.fcmTokens) {
      await sendNotification(fcm.token, title, body, data);
      sent = true;
    }
    return successResponse(res, { messageId: 'mock-id', sent });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getTokens = async (req, res) => {
  try {
    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } })
      .select('name mobile fcmTokens')
      .sort({ createdAt: -1 });

    const tokenStats = {
      totalUsers: users.length,
      totalTokens: users.reduce((sum, user) => sum + user.fcmTokens.length, 0),
      platforms: {
        web: 0,
        android: 0,
        ios: 0
      }
    };

    users.forEach(user => {
      user.fcmTokens.forEach(token => {
        tokenStats.platforms[token.platform] = (tokenStats.platforms[token.platform] || 0) + 1;
      });
    });

    return successResponse(res, { users, stats: tokenStats });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const sendToRole = async (req, res) => {
  const { role, title, body, data } = req.body;
  
  try {
    let users = [];
    
    if (role === 'user') {
      // Send to all regular users
      users = await User.find({ fcmTokens: { $exists: true, $ne: [] } });
    } else {
      // Send to admins with specific role
      const admins = await Admin.find({ role }).populate('role');
      // For now, we'll assume admins don't have FCM tokens in this implementation
      // In a real app, you'd add FCM tokens to Admin model too
      return successResponse(res, { sent: 0, message: 'Admin FCM not implemented yet' });
    }

    let sentCount = 0;
    for (const user of users) {
      for (const fcmToken of user.fcmTokens) {
        try {
          await sendNotification(fcmToken.token, title, body, data);
          sentCount++;
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    }

    return successResponse(res, { sent: sentCount, total: users.length });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const sendBroadcast = async (req, res) => {
  const { title, body, data } = req.body;
  
  try {
    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } });
    
    let sentCount = 0;
    for (const user of users) {
      for (const fcmToken of user.fcmTokens) {
        try {
          await sendNotification(fcmToken.token, title, body, data);
          sentCount++;
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    }

    return successResponse(res, { 
      sent: sentCount, 
      totalUsers: users.length,
      message: 'Broadcast notification sent successfully'
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { updateToken, sendToUser, getTokens, sendToRole, sendBroadcast };