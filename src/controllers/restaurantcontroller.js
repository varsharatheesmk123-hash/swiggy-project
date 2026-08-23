const Restaurant = require('../models/restaurant');
const User = require('../models/user');
const connectDB = require('../db');
exports.getRecommendations = async (req, res) => {
    try {
        await connectDB();
        const { userId } = req.params;

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userCuisines = user.preferences?.favoriteCuisines || [];

        
        const recommendations = await Restaurant.aggregate([
            {
                $addFields: {
                    
                    cuisineMatchScore: {
                        $cond: {
                            if: { $gt: [{ $size: { $setIntersection: ["$cuisines", userCuisines] } }, 0] },
                            then: 40,
                            else: 10
                        }
                    },
                    
                    ratingScore: { $multiply: ["$rating", 10] },
                    
                    popularityScore: { $cond: [{ $gt: ["$numRatings", 100] }, 10, 5] }
                }
            },
            {
                $addFields: {
                    
                    recommendationScore: {
                        $add: ["$cuisineMatchScore", "$ratingScore", "$popularityScore"]
                    }
                }
            },
            { $sort: { recommendationScore: -1 } }, 
            { $limit: 10 } 
        ]);

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating restaurant recommendations",
            error: error.message
        });
    }
};

exports.searchRestaurants = async (req, res) => {
    try {
        await connectDB();
        const { search, cuisine, rating, maxDeliveryTime, isVeg, sort, page = 1, limit = 10 } = req.query;
        
        
        let filter = { isApproved: true };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { cuisines: { $regex: search, $options: 'i' } }
            ];
        }

        
        if (cuisine) {
            
            const cuisineList = cuisine.split(',').map(c => c.trim());
            filter.cuisines = { $in: cuisineList };
        }

        
        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }

        
        if (maxDeliveryTime) {
            filter.deliveryTime = { $lte: Number(maxDeliveryTime) };
        }

        
        if (isVeg) {
            filter.isVeg = isVeg === 'true';
        }

        
        let sortOption = { createdAt: -1 }; 
        if (sort) {
            if (sort === 'costLowToHigh') sortOption = { costForTwo: 1 };
            if (sort === 'costHighToLow') sortOption = { costForTwo: -1 };
            if (sort === 'fastestDelivery') sortOption = { deliveryTime: 1 };
            if (sort === 'topRated') sortOption = { rating: -1 };
        }

        
        const skip = (Number(page) - 1) * Number(limit);
        const restaurants = await Restaurant.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: restaurants.length,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            data: restaurants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching restaurants',
            error: error.message
        });
    }
};


exports.adminCreateRestaurant = async (req, res) => {
    try {
        await connectDB();
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only administrators can perform this action.'
            });
        }

        const restaurant = await Restaurant.create({
            ...req.body,
            isApproved: true 
        });

        res.status(201).json({
            success: true,
            message: 'Restaurant created successfully by Administrator',
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Admin error creating restaurant',
            error: error.message
        });
    }
};


exports.adminUpdateRestaurant = async (req, res) => {
    try {
        await connectDB();
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only administrators can update data.'
            });
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.restaurantId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Restaurant updated successfully by Administrator',
            data: updatedRestaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Admin error updating restaurant',
            error: error.message
        });
    }
};

exports.createRestaurant = async (req, res) => {
    try {
        await connectDB();
        console.log("LOGGED IN USER:", req.user);
        if (req.user.role !== 'restaurant') {
            return res.status(403).json({
                success: false,
                message: 'Only restaurant owners can create restaurants'
            });
        }

        
        const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
        if (existingRestaurant) {
            return res.status(400).json({
                success: false,
                message: 'You already have a restaurant registered'
            });
        }

        
        const restaurant = await Restaurant.create({
            ...req.body,
            owner: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Restaurant created successfully',
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getMyRestaurants = async (req, res) => {
    try {
        await connectDB();
        const restaurants = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurants) {
            return res.status(404).json({ 
                success: false,
                message: 'You dont have a restaurant registered'
            });
        }
        res.status(200).json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching my restaurants',
            error: error.message
        });
    }
};


exports.updateRestaurant = async (req, res) => {
    try {
        await connectDB();
        const restaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'You dont have a restaurant registered'
            });
        }

        if (restaurant.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this restaurant'
            });
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Restaurant updated successfully',
            data: updatedRestaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating restaurant',
            error: error.message
        });
    }
};


exports.getAllRestaurants = async (req, res) => {
    try {
        await connectDB();
        let { city, page = 1, limit = 10 } = req.query;
        const query = {};
        if (city) {
            query.city = city;
        }

        const restaurants = await Restaurant.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurants',
            error: error.message
        });
    }
};

exports.getRestaurantById = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurant',
            error: error.message
        });
    }
};

