const Order = require('../models/order.js');
const User = require('../models/user.js');
const Restaurant = require('../models/restaurant.js');
const SurgeSettings = require('../models/surgeSetting.js');
const FraudLog = require('../models/Fraudlog.js'); 


exports.updateSurgeSettings = async (req, res) => {
    try {
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only administrators can configure pricing.'
            });
        }

        const { baseDeliveryFee, peakHours, highDemandRegions } = req.body;

        
        let settings = await SurgeSettings.findOne();

        if (settings) {
            settings.baseDeliveryFee = baseDeliveryFee ?? settings.baseDeliveryFee;
            settings.peakHours = peakHours ?? settings.peakHours;
            settings.highDemandRegions = highDemandRegions ?? settings.highDemandRegions;
            await settings.save();
        } else {
            settings = await SurgeSettings.create({
                baseDeliveryFee,
                peakHours,
                highDemandRegions
            });
        }

        res.status(200).json({
            success: true,
            message: 'Surge pricing parameters successfully synchronized',
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Admin error configuration failed',
            error: error.message
        });
    }
};

exports.getallUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.approveRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }
        restaurant.isApproved = !restaurant.isApproved;
        await restaurant.save();
        res.status(200).json({
            success: true,
            message: `Restaurant ${restaurant.isApproved ? 'approved' : 'disapproved'} successfully`,
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        .populate('user', 'name email')
        .populate('restaurant', "name");
        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getplatformStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();
        const totalOrders = await order.countDocuments();
        const totalRevenue = await order.aggregate([
            {$match: { paymentStatus: 'Paid' }},
            {$group: { _id: null, totalRevenue: { $sum: '$totalAmount' }}},
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRestaurants,
                totalOrders,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getFlaggedOrders = async (req, res) => {
  try {
    const logs = await FraudLog.find()
      .populate('userId', 'name email')
      .populate('orderId');
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.reviewFraudOrder = async (req, res) => {
  const { logId, action } = req.body; 
  try {
    const log = await FraudLog.findById(logId);
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });

    log.status = action;
    await log.save();

    const orderData = await order.findById(log.orderId);
    if (orderData && action === 'Rejected') {
      orderData.status = 'Rejected by Admin';
      await orderData.save();
    }

    res.status(200).json({ success: true, message: `Order successfully ${action.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
