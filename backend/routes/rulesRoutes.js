const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rulesController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { rulesValidation } = require('../middleware/validationMiddleware');

// Get all rules (public access for users to view rules)
router.get('/', rulesController.getRules);

// Admin only routes
router.post('/', verifyToken, isAdmin, rulesValidation, rulesController.createRule);
router.put('/:id', verifyToken, isAdmin, rulesValidation, rulesController.updateRule);
router.delete('/:id', verifyToken, isAdmin, rulesController.deleteRule);

module.exports = router;