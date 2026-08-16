const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addToCart, getCart, clearCart } = require('../controllers/cartcontroller');


router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.delete('/clear', protect, clearCart);

module.exports = router;