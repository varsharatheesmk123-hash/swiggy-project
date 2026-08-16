const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { addMenuItem, deleteMenuItem, getMenuByRestaurant } = require('../controllers/menucontroller');
const { getMyRestaurants, getAllRestaurants } = require('../controllers/restaurantcontroller');

router.post('/', protect, addMenuItem);
router.get('/my', protect, getMyRestaurants);
router.delete('/:id', protect, deleteMenuItem);
router.put('/', protect, getAllRestaurants);
router.get('/:restaurantId', getMenuByRestaurant);
module.exports = router;

