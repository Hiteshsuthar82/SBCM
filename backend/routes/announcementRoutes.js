const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { singleUpload, compressFile } = require('../middleware/uploadMiddleware');
const { announcementValidation } = require('../middleware/validationMiddleware');
const { fileUploadLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', verifyToken, isAdmin, fileUploadLimiter, singleUpload.single('image'), compressFile, announcementValidation, announcementController.createAnnouncement);
router.get('/', announcementController.getAnnouncements);
router.post('/:id/like', verifyToken, announcementController.likeAnnouncement);

module.exports = router;