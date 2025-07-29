const Announcement = require('../models/Announcement');
const ActionHistory = require('../models/ActionHistory');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const createAnnouncement = async (req, res) => {
  const { title, description, route, scheduledAt } = req.body;
  const image = req.file ? req.file.path : undefined;
  try {
    const announcement = new Announcement({
      title,
      description,
      image,
      route,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy: req.user.id,
    });
    await announcement.save();

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'create',
      resource: 'announcement',
      resourceId: announcement._id,
      details: `Created announcement: ${title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Broadcast notification
    // For simplicity, notify all users; use topics in FCM for production
    return successResponse(res, announcement);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getAnnouncements = async (req, res) => {
  const { page = 1, limit = 10, route = 'all' } = req.query;
  const filter = { isActive: true };
  if (route !== 'all') filter.route = route;
  try {
    const announcements = await Announcement.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Announcement.countDocuments(filter);
    const pagination = { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) };
    // Add stats: likes.length, dislikes.length, views.length
    const withStats = announcements.map(a => ({ ...a.toJSON(), likes: a.likes.length, dislikes: a.dislikes.length, views: a.views.length }));
    return successResponse(res, withStats, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const likeAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) return errorResponse(res, 'Announcement not found', 404);
    const userLiked = announcement.likes.some(l => l.userId.toString() === req.user.id);
    if (userLiked) {
      announcement.likes = announcement.likes.filter(l => l.userId.toString() !== req.user.id);
    } else {
      announcement.likes.push({ userId: req.user.id });
      // Remove from dislikes if present
      announcement.dislikes = announcement.dislikes.filter(d => d.userId.toString() !== req.user.id);
    }
    await announcement.save();
    return successResponse(res, { likes: announcement.likes.length, userLiked: !userLiked });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, description, route, scheduledAt } = req.body;
  const image = req.file ? req.file.path : undefined;
  
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return errorResponse(res, 'Announcement not found', 404);
    }

    // Update fields
    announcement.title = title || announcement.title;
    announcement.description = description || announcement.description;
    announcement.route = route || announcement.route;
    announcement.scheduledAt = scheduledAt ? new Date(scheduledAt) : announcement.scheduledAt;
    if (image) announcement.image = image;
    announcement.updatedAt = new Date();

    await announcement.save();

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'update',
      resource: 'announcement',
      resourceId: announcement._id,
      details: `Updated announcement: ${announcement.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, announcement);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return errorResponse(res, 'Announcement not found', 404);
    }

    const announcementTitle = announcement.title;
    await Announcement.findByIdAndDelete(id);

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'delete',
      resource: 'announcement',
      resourceId: id,
      details: `Deleted announcement: ${announcementTitle}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, { message: 'Announcement deleted successfully' });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { 
  createAnnouncement, 
  getAnnouncements, 
  likeAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
};