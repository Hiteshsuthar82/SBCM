const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { approveComplaint, updateComplaintStatus } = require('../services/complaintService');
const { awardPoints } = require('../services/pointsService');

const createComplaint = async (req, res) => {
  const { type, description, stop, dateTime, latitude, longitude, address, dynamicFields } = req.body;
  const evidence = req.files ? req.files.map(file => file.path) : [];
  try {
    const token = `BRTS${Math.floor(100000 + Math.random() * 900000)}`; // Auto-generate token
    const complaint = new Complaint({
      token,
      type,
      description,
      stop,
      dateTime: dateTime ? new Date(dateTime) : undefined,
      location: { latitude, longitude, address },
      evidence,
      userId: req.user.id,
      dynamicFields: dynamicFields ? JSON.parse(dynamicFields) : {},
    });
    await complaint.save();
    // Award submission points
    await awardPoints(req.user.id, require('../config/config').points.submission, 'complaint_submission', complaint._id);
    // Notify admin (broadcast or specific)
    global.io.emit('newComplaint', { id: complaint._id });
    return successResponse(res, { id: complaint._id, token: complaint.token, status: complaint.status, points: require('../config/config').points.submission });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createComplaintAnonymous = async (req, res) => {
  const { type, description, stop, dateTime, latitude, longitude, address, dynamicFields } = req.body;
  const evidence = req.files ? req.files.map(file => file.path) : [];
  try {
    const token = `BRTS${Math.floor(100000 + Math.random() * 900000)}`; // Auto-generate token
    const complaint = new Complaint({
      token,
      type,
      description,
      stop,
      dateTime: dateTime ? new Date(dateTime) : undefined,
      location: latitude && longitude ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude), address } : undefined,
      evidence,
      userId: req.user ? req.user.id : null, // Allow anonymous submissions
      dynamicFields: dynamicFields ? JSON.parse(dynamicFields) : {},
      isAnonymous: !req.user,
    });
    await complaint.save();
    
    // Award submission points only if user is logged in
    if (req.user) {
      await awardPoints(req.user.id, require('../config/config').points.submission, 'complaint_submission', complaint._id);
    }
    
    // Notify admin (broadcast or specific)
    if (global.io) {
      global.io.emit('newComplaint', { id: complaint._id });
    }
    
    return successResponse(res, { 
      id: complaint._id, 
      token: complaint.token, 
      status: complaint.status, 
      points: req.user ? require('../config/config').points.submission : 0,
      message: req.user ? 'Complaint submitted successfully! Points awarded.' : 'Complaint submitted successfully!'
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const trackComplaint = async (req, res) => {
  const { token } = req.params;
  try {
    const complaint = await Complaint.findOne({ token });
    if (!complaint) return errorResponse(res, 'Complaint not found', 404);
    return successResponse(res, complaint);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getUserHistory = async (req, res) => {
  const { page = 1, limit = 10, status = 'all', type = 'all' } = req.query;
  const filter = { userId: req.user.id };
  if (status !== 'all') filter.status = status;
  if (type !== 'all') filter.type = type;
  try {
    const complaints = await Complaint.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Complaint.countDocuments(filter);
    const pagination = { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) };
    return successResponse(res, complaints, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getUserComplaints = async (req, res) => {
  const { limit = 10 } = req.query;
  const filter = { userId: req.user.id };
  try {
    const complaints = await Complaint.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    return successResponse(res, complaints);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getAllComplaints = async (req, res) => {
  const { page = 1, limit = 10, status = 'all', priority = 'all', assignedTo = 'all' } = req.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (priority !== 'all') filter.priority = priority;
  if (assignedTo !== 'all') filter.assignedTo = assignedTo;
  try {
    const complaints = await Complaint.find(filter)
      .populate('userId', 'name mobile')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Complaint.countDocuments(filter);
    const pagination = { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) };
    return successResponse(res, complaints, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const approve = async (req, res) => {
  const { id } = req.params;
  const { status, reason, description, points } = req.body;
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) return errorResponse(res, 'Complaint not found', 404);
    await updateComplaintStatus(complaint, status, reason, description, req.user.id);
    let pointsAwarded = 0;
    if (status === 'approved') {
      pointsAwarded = points || require('../config/config').points.approval;
      await approveComplaint(id, pointsAwarded, complaint.userId);
    }
    return successResponse(res, { complaint, pointsAwarded });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { createComplaint, createComplaintAnonymous, trackComplaint, getUserHistory, getUserComplaints, getAllComplaints, approve };