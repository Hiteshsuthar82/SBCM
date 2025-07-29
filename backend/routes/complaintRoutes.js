const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { verifyToken, optionalAuth, isAdmin } = require('../middleware/authMiddleware');
const { upload, compressFile } = require('../middleware/uploadMiddleware');
const { complaintValidation } = require('../middleware/validationMiddleware');
const { fileUploadLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', optionalAuth, fileUploadLimiter, upload, compressFile, complaintValidation, complaintController.createComplaintAnonymous);
router.get('/track/:token', complaintController.trackComplaint);
router.get('/history', verifyToken, complaintController.getUserHistory);
router.get('/user', verifyToken, complaintController.getUserComplaints);
router.get('/', verifyToken, isAdmin, complaintController.getAllComplaints);
router.put('/:id/approve', verifyToken, isAdmin, complaintController.approve);

module.exports = router;