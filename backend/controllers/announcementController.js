const Announcement = require('../models/Announcement');
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

module.exports = { createAnnouncement, getAnnouncements, likeAnnouncement };