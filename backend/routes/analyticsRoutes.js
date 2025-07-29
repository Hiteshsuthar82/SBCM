const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, isAdmin, analyticsController.getDashboard);
router.get('/complaints', verifyToken, isAdmin, analyticsController.getComplaintsAnalytics);
router.get('/users', verifyToken, isAdmin, analyticsController.getUsersAnalytics);
router.get('/system', verifyToken, isAdmin, analyticsController.getSystemAnalytics);
router.get('/engagement', verifyToken, isAdmin, analyticsController.getEngagementAnalytics);
router.get('/export/:type', verifyToken, isAdmin, analyticsController.exportReport);

module.exports = router;