const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { upload, compressFile } = require('../middleware/uploadMiddleware');
const { complaintValidation } = require('../middleware/validationMiddleware');
const { fileUploadLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', verifyToken, fileUploadLimiter, upload, compressFile, complaintValidation, complaintController.createComplaint);
router.get('/track/:token', complaintController.trackComplaint);
router.get('/history', verifyToken, complaintController.getUserHistory);
router.get('/', verifyToken, isAdmin, complaintController.getAllComplaints);
router.put('/:id/approve', verifyToken, isAdmin, complaintController.approve);

module.exports = router;