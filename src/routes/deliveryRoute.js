const express = require('express');
const router = express.Router();
const { setDeliveryStatus } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.put('/set-status', protect, authorize('delivery'), setDeliveryStatus);

module.exports = router;