const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { userUpdateValidation } = require('../middleware/validationMiddleware');

router.get('/', verifyToken, isAdmin, userController.getUsers);
router.get('/:id', verifyToken, isAdmin, userController.getUserById);
router.put('/:id', verifyToken, isAdmin, userUpdateValidation, userController.updateUser);
router.put('/:id/activate', verifyToken, isAdmin, userController.activateUser);
router.put('/:id/deactivate', verifyToken, isAdmin, userController.deactivateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;