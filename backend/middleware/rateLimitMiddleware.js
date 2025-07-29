const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, error: 'Too many file uploads, please try again later.' },
});

const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 notifications per hour
  message: { success: false, error: 'Too many notifications sent, please try again later.' },
});

module.exports = { authLimiter, fileUploadLimiter, notificationLimiter };