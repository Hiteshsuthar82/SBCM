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
  // Notify user
  const user = await User.findById(complaint.userId);
  user.fcmTokens.forEach(({ token }) => sendNotification(token, 'Complaint Update', `Your complaint ${complaint.token} is now ${status}`));
  // Real-time
  global.io.to(complaint.userId.toString()).emit('complaintUpdate', complaint);
};

const approveComplaint = async (complaintId, points, userId) => {
  const complaint = await Complaint.findById(complaintId);
  complaint.points = points;
  await complaint.save();
  await awardPoints(userId, points, 'complaint_approval', complaintId);
};

module.exports = { updateComplaintStatus, approveComplaint };