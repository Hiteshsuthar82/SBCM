const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { adminValidation, adminUpdateValidation } = require('../middleware/validationMiddleware');

// All routes require admin access
router.get('/', verifyToken, isAdmin, adminsController.getAdmins);
router.get('/:id', verifyToken, isAdmin, adminsController.getAdminById);
router.post('/', verifyToken, isAdmin, adminValidation, adminsController.createAdmin);
router.put('/:id', verifyToken, isAdmin, adminUpdateValidation, adminsController.updateAdmin);
router.put('/:id/role', verifyToken, isAdmin, adminsController.changeAdminRole);
router.put('/:id/activate', verifyToken, isAdmin, adminsController.activateAdmin);
router.put('/:id/deactivate', verifyToken, isAdmin, adminsController.deactivateAdmin);
router.delete('/:id', verifyToken, isAdmin, adminsController.deleteAdmin);

module.exports = router;