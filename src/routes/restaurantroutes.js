const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantcontroller.js');


const { protect } = require('../middleware/authMiddleware');


router.get('/recommendations/:userId', restaurantController.getRecommendations);
router.get('/search', restaurantController.searchRestaurants);
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

router.post('/', protect, restaurantController.createRestaurant);
router.get('/my', protect, restaurantController.getMyRestaurants);
router.put('/:id', protect, restaurantController.updateRestaurant);

module.exports = router;
