const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { withdrawalValidation } = require('../middleware/validationMiddleware');

router.post('/', verifyToken, withdrawalValidation, withdrawalController.createWithdrawal);
router.get('/', verifyToken, isAdmin, withdrawalController.getWithdrawals);
router.put('/:id/approve', verifyToken, isAdmin, withdrawalController.approveWithdrawal);

module.exports = router;