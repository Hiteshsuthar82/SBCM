const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { configUpdateValidation, bulkConfigValidation } = require('../middleware/validationMiddleware');

// Get config (some configs can be public for users)
router.get('/', verifyToken, configController.getConfig);

// Admin only routes
router.put('/', verifyToken, isAdmin, configUpdateValidation, configController.updateConfig);
router.put('/bulk', verifyToken, isAdmin, bulkConfigValidation, configController.bulkUpdateConfig);

// Specific config endpoints
router.get('/complaint-types', verifyToken, configController.getComplaintTypes);
router.put('/complaint-types', verifyToken, isAdmin, configController.updateComplaintTypes);

module.exports = router;