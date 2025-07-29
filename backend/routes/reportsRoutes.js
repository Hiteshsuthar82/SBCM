const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { reportValidation } = require('../middleware/validationMiddleware');

// All routes require admin access
router.get('/', verifyToken, isAdmin, reportsController.getReports);
router.post('/generate', verifyToken, isAdmin, reportValidation, reportsController.generateReport);
router.get('/:id/download', verifyToken, isAdmin, reportsController.downloadReport);
router.post('/schedule', verifyToken, isAdmin, reportsController.scheduleReport);

module.exports = router;