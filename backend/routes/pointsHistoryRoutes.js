const express = require('express');
const router = express.Router();
const pointsHistoryController = require('../controllers/pointsHistoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// User can get their own points history
router.get('/', verifyToken, pointsHistoryController.getPointsHistory);

// Admin can get any user's points history
router.get('/user/:userId', verifyToken, isAdmin, pointsHistoryController.getPointsHistoryByUser);

module.exports = router;