const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { notificationLimiter } = require('../middleware/rateLimitMiddleware');

// Notification management routes
router.post('/send', verifyToken, isAdmin, notificationLimiter, notificationController.sendNotification);
router.get('/history', verifyToken, isAdmin, notificationController.getNotificationHistory);

// Template management routes
router.get('/templates', verifyToken, isAdmin, notificationController.getNotificationTemplates);
router.post('/templates', verifyToken, isAdmin, notificationController.createNotificationTemplate);
router.put('/templates/:id', verifyToken, isAdmin, notificationController.updateNotificationTemplate);
router.delete('/templates/:id', verifyToken, isAdmin, notificationController.deleteNotificationTemplate);

module.exports = router;