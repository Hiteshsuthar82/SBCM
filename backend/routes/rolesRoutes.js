const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { rolesValidation } = require('../middleware/validationMiddleware');

// All routes require admin access
router.get('/', verifyToken, isAdmin, rolesController.getRoles);
router.get('/:id', verifyToken, isAdmin, rolesController.getRoleById);
router.post('/', verifyToken, isAdmin, rolesValidation, rolesController.createRole);
router.put('/:id', verifyToken, isAdmin, rolesValidation, rolesController.updateRole);
router.delete('/:id', verifyToken, isAdmin, rolesController.deleteRole);

module.exports = router;