const express = require('express');
const router = express.Router();
const quickToursController = require('../controllers/quickToursController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { quickTourValidation } = require('../middleware/validationMiddleware');

// Get tours for current user's role
router.get('/', verifyToken, quickToursController.getQuickTours);
router.get('/:id', verifyToken, quickToursController.getQuickTourById);

// Admin only routes
router.post('/', verifyToken, isAdmin, quickTourValidation, quickToursController.createQuickTour);
router.put('/:id', verifyToken, isAdmin, quickTourValidation, quickToursController.updateQuickTour);
router.delete('/:id', verifyToken, isAdmin, quickToursController.deleteQuickTour);
router.put('/:id/assign', verifyToken, isAdmin, quickToursController.assignTourToRoles);

// User action routes
router.post('/:id/complete', verifyToken, quickToursController.markTourCompleted);

module.exports = router;