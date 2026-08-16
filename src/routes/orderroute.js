const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    placeOrder, 
    getMyOrders, 
    mockPayment, 
    getRestaurantOrders, 
    updateOrderStatus,
    calculateDeliveryFee,
    getOrderDetails,
    
} = require('../controllers/ordercontroller');

router.use(protect);
router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.post("/verify", mockPayment);
router.get('/calculate-delivery-fee', calculateDeliveryFee);
router.get("/restaurant", authorize("restaurant"), getRestaurantOrders);
router.put("/:id/status", authorize("restaurant"), updateOrderStatus);
router.get('/:orderId', getOrderDetails); 

module.exports = router;