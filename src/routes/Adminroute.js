const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getallUsers, 
    toggleBlockUser, 
    approveRestaurant, 
    getAllOrders, 
    getplatformStatistics, 
    getFlaggedOrders, 
    reviewFraudOrder,
    updateSurgeSettings
} = require('../controllers/Admincontroller');
const restaurantController = require('../controllers/restaurantcontroller');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getallUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/restaurants/:id/approve', approveRestaurant);
router.get('/orders', getAllOrders);
router.get('/statistics', getplatformStatistics);
router.get('/fraud/orders', getFlaggedOrders); 
router.post('/fraud/review', reviewFraudOrder);

router.post('/restaurants/create', restaurantController.createRestaurant); 
router.put('/restaurants/update/:restaurantId', restaurantController.updateRestaurant); 
router.put('/surge-settings', updateSurgeSettings);

module.exports = router;