const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, adminLoginValidation, sendOtpValidation } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

// User authentication routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/send-otp', authLimiter, sendOtpValidation, authController.sendLoginOtp);
router.post('/login', authLimiter, loginValidation, authController.login);

// Admin authentication routes
router.post('/admin/login', authLimiter, adminLoginValidation, authController.adminLogin);
router.post('/admin/regester', authLimiter, authController.adminRegester);

// Token management routes
router.get('/verify', verifyToken, authController.verifyToken);
router.post('/refresh', authController.refreshToken);

module.exports = router;