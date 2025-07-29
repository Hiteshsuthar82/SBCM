const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { fcmTokenValidation, fcmSendValidation, fcmBroadcastValidation, fcmRoleValidation } = require('../middleware/validationMiddleware');

// Token management
router.post('/update-token', verifyToken, fcmTokenValidation, fcmController.updateToken);
router.get('/tokens', verifyToken, isAdmin, fcmController.getTokens);

// Send notifications (admin only)
router.post('/send-to-user', verifyToken, isAdmin, fcmSendValidation, fcmController.sendToUser);
router.post('/send-to-role', verifyToken, isAdmin, fcmRoleValidation, fcmController.sendToRole);
router.post('/broadcast', verifyToken, isAdmin, fcmBroadcastValidation, fcmController.sendBroadcast);

module.exports = router;