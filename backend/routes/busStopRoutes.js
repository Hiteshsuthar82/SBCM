const express = require('express');
const router = express.Router();
const busStopController = require('../controllers/busStopController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { busStopValidation } = require('../middleware/validationMiddleware');

router.get('/', verifyToken, busStopController.getBusStops);
router.post('/', verifyToken, isAdmin, busStopValidation, busStopController.createBusStop);
router.put('/:id', verifyToken, isAdmin, busStopValidation, busStopController.updateBusStop);
router.delete('/:id', verifyToken, isAdmin, busStopController.deleteBusStop);
router.put('/:id/activate', verifyToken, isAdmin, busStopController.activateBusStop);
router.put('/:id/deactivate', verifyToken, isAdmin, busStopController.deactivateBusStop);

module.exports = router;