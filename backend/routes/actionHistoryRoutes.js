const express = require('express');
const router = express.Router();
const actionHistoryController = require('../controllers/actionHistoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes require admin access
router.get('/', verifyToken, isAdmin, actionHistoryController.getActionHistory);
router.get('/:id', verifyToken, isAdmin, actionHistoryController.getActionById);

module.exports = router;