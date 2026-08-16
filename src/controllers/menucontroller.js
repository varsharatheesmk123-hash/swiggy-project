const Menu = require('../models/menu.js');


exports.addMenuItem = async (req, res) => {
    try {
        const { restaurant, name, description, price, category, image } = req.body;

        
        if (!restaurant || !name || !price) {
            return res.status(400).json({
                success: false,
                message: "Restaurant, name, and price are required",
            });
        }

        
        const menuItem = await Menu.create({
            restaurant,
            name,
            description,
            price,
            category,
            image
        });

        res.status(201).json({
            success: true,
            message: "Menu item successfully added",
            data: menuItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add menu item",
            error: error.message
        });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        
        const deletedItem = await Menu.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item successfully deleted",
            data: deletedItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete menu item",
            error: error.message
        });
    }
};

exports.getMenuByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const menuItems = await Menu.find({ restaurant: restaurantId });

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching the menu",
            error: error.message
        });
    }
};