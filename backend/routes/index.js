const express = require('express');
const router = express.Router();

// Core authentication and user routes
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));

// Main feature routes
router.use('/complaints', require('./complaintRoutes'));
router.use('/withdrawals', require('./withdrawalRoutes'));
router.use('/announcements', require('./announcementRoutes'));
router.use('/bus-stops', require('./busStopRoutes'));

// User-specific routes
router.use('/profiles', require('./profileRoutes'));
router.use('/points', require('./pointsRoutes'));
router.use('/leaderboard', require('./leaderboardRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

// Admin management routes
router.use('/rules', require('./rulesRoutes'));
router.use('/roles', require('./rolesRoutes'));
router.use('/admins', require('./adminsRoutes'));
router.use('/quick-tours', require('./quickToursRoutes'));

// Analytics and reporting routes
router.use('/analytics', require('./analyticsRoutes'));
router.use('/reports', require('./reportsRoutes'));
router.use('/action-history', require('./actionHistoryRoutes'));
router.use('/points/history', require('./pointsHistoryRoutes'));

// System configuration and notifications
router.use('/config', require('./configRoutes'));
router.use('/fcm', require('./fcmRoutes'));
router.use('/notifications', require('./notificationRoutes'));

module.exports = router;