const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActionHistory = require('../models/ActionHistory');
const { sendNotification } = require('../utils/notificationUtil');
const { awardPoints } = require('./pointsService');

const updateComplaintStatus = async (complaint, status, reason, description, adminId) => {
  complaint.status = status;
  complaint.reason = reason;
  complaint.adminDescription = description;
  complaint.timeline.push({
    action: 'status_update',
    status,
    reason,
    description,
    adminId,
    timestamp: new Date(),
  });
  await complaint.save();
  // Log action
  await ActionHistory.create({
    adminId,
    action: 'update_complaint',
    resource: 'complaint',
    resourceId: complaint._id,
    details: { status },
  });
  // Notify user (only if not anonymous)
  if (complaint.userId) {
    const user = await User.findById(complaint.userId);
    if (user && user.fcmTokens) {
      user.fcmTokens.forEach(({ token }) => sendNotification(token, 'Complaint Update', `Your complaint ${complaint.token} is now ${status}`));
    }
    // Real-time
    if (global.io) {
      global.io.to(complaint.userId.toString()).emit('complaintUpdate', complaint);
    }
  }
};

const approveComplaint = async (complaintId, points, userId) => {
  const complaint = await Complaint.findById(complaintId);
  complaint.points = points;
  await complaint.save();
  // Only award points if user exists (not anonymous)
  if (userId) {
    await awardPoints(userId, points, 'complaint_approval', complaintId);
  }
};

module.exports = { updateComplaintStatus, approveComplaint };