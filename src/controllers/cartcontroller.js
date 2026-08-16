const Cart = require('../models/cart.js');
const Menu = require('../models/menu.js');


exports.addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than zero.'
            });
        }

        const menuItem = await Menu.findById(menuItemId).populate('restaurant');
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                restaurant: menuItem.restaurant._id,
                items: [{ menuItem: menuItem._id, quantity }]
            });
        } else {
            if (cart.restaurant.toString() !== menuItem.restaurant._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'You can only add items from one restaurant at a time.'
                });
            }

            const existingItemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({ menuItem: menuItem._id, quantity });
            }
        }

        await cart.populate('items.menuItem');
        cart.totalamount = cart.items.reduce(
            (total, item) => total + (item.menuItem.price * item.quantity),
            0
        );

        await cart.save();
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully.',
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart.',
            error: error.message
        });
    }
};
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem');
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart.',
            error: error.message
        });
    }
};


exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({ user: req.user._id });
        
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart.',
            error: error.message
        });
    }
};