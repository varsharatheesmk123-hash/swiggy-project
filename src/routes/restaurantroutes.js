const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantcontroller');


const { protect } = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/restaurantController');
const { getAllRestaurants, getRestaurantById } = require('../controllers/restaurantController');


router.get('/recommendations/:userId', getRecommendations);
router.get('/search', restaurantController.searchRestaurants);
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

router.post('/', protect, restaurantController.createRestaurant);
router.get('/my', protect, restaurantController.getMyRestaurants);
router.put('/:id', protect, restaurantController.updateRestaurant);

module.exports = router;