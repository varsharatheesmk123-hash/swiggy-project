const Order = require('../models/order.js'); 
const Cart = require('../models/cart.js');
const Restaurant = require('../models/restaurant.js');
const FraudLog = require('../models/FraudLog');
const User = require('../models/user.js');
const SurgeSettings = require('../models/surgeSetting.js'); 
const { evaluateOrderRisk } = require('../utils/fraudDetector');


const calculateSurgeFeeInternal = async (city) => {
    const settings = await SurgeSettings.findOne().sort({ createdAt: -1 });
    if (!settings) return 40; 

    let finalMultiplier = 1.0;
    const currentHour = new Date().getHours();

    const activePeakTime = settings.peakHours.find(
        slot => currentHour >= slot.startHour && currentHour <= slot.endHour
    );
    if (activePeakTime) {
        finalMultiplier *= activePeakTime.multiplier;
    }

    if (city) {
        const regionData = settings.highDemandRegions.find(
            r => r.city.toLowerCase() === city.toLowerCase() && r.isHighDemand
        );
        if (regionData) {
            finalMultiplier *= regionData.regionalMultiplier;
        }
    }

    return Math.round(settings.baseDeliveryFee * finalMultiplier);
};

exports.calculateDeliveryFee = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ success: false, message: 'City parameter is required' });
        }

        const deliveryFee = await calculateSurgeFeeInternal(city);
        res.status(200).json({
            success: true,
            deliveryFee
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.placeOrder = async (req, res) => {
    try {
        const { deliveryAddress, city } = req.body;

        
        const cart = await Cart.findOne({ user: req.user._id })
       .populate('restaurant')
       .populate('items.menuItem');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

       const items = cart.items;
        const deliveryFee = await calculateSurgeFeeInternal(city || 'default');
        const itemsPrice = items.reduce((total, item) => {
            const itemPrice = item.price || (item.menuItem && item.menuItem.price) || 0;
            return total + (Number(itemPrice) * Number(item.quantity));
        }, 0);

        const calculatedTotal = itemsPrice + Number(deliveryFee || 0);
        
        const newOrder = await Order.create({
            user: req.user._id,
            restaurant: cart.restaurant._id,
            items,
            deliveryfee: Number(deliveryFee || 0),
            deliveryFee: Number(deliveryFee || 0),
            totalamount: calculatedTotal,
            totalAmount: calculatedTotal,
            deliveryAddress,
        
        });

        
        try {
            const restaurant = cart.restaurant; 
            if (restaurant && restaurant.cuisine) {
                const cuisinesToSet = Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [restaurant.cuisine];
                
                await User.findByIdAndUpdate(req.user._id, {
                    $addToSet: { 'preferences.favoriteCuisines': { $each: cuisinesToSet } }
                });
                console.log(`User preferences updated with cuisines: ${cuisinesToSet.join(', ')}`);
            }
        } catch (prefError) {
            console.error("User preference update error:", prefError.message);
        }

        
        const { assignDeliveryPartner } = require('../utils/deliveryAllocator.js');
        const assignedPartner = await assignDeliveryPartner(newOrder, cart.restaurant.location);

        if (assignedPartner) {
            console.log(`Smart Assignment Success: Partner ${assignedPartner._id} allocated to Order ${newOrder._id}`);
        } else {
            console.log(`Queue Mode: Order ${newOrder._id} is holding for an available proximity partner.`);
        }

        
        const { riskScore, reasons } = await evaluateOrderRisk(req.user._id);
        if (riskScore >= 50) {
            newOrder.isSuspicious = true;
            newOrder.riskScore = riskScore;
            await newOrder.save();

            await FraudLog.create({
                userId: req.user._id,
                orderId: newOrder._id,
                riskScore: riskScore,
                reasons: reasons
            });
        }

        
        cart.items = [];
        await cart.save();
        res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.mockPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const activeOrder = await Order.findById(orderId);
        
        if (!activeOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        activeOrder.paymentStatus = 'Paid';
        activeOrder.orderStatus = 'confirmed';
        await activeOrder.save();

        res.status(200).json({
            success: true,
            message: 'Payment successful and order confirmed',
            data: activeOrder,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('restaurant');
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getRestaurantOrders = async (req, res) => {
    try {
        const orders = await Order.find({ restaurant: req.user._id }).populate('user', 'name email');
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch restaurant orders",
            error: error.message
        });
    }
};


exports.updateOrderStatus = async (req, res) => {
    const socketConfig = require('../config/socket');

    try {
        const { id } = req.params;
        const { status } = req.body; 

        
        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { orderStatus: status }, 
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        
        if (status === 'Delivered') {
            if (updatedOrder.deliveryPartner) {
                await User.findByIdAndUpdate(updatedOrder.deliveryPartner, {
                    isAvailable: true,
                    currentWorkload: 0
                });
                console.log(`Lifecycle Complete: Partner ${updatedOrder.deliveryPartner} metrics reset to free.`);
            }
        }

        
        if (status === 'cancelled' || status === 'Cancelled') {
            const { riskScore, reasons } = await evaluateOrderRisk(req.user._id);

            if (riskScore >= 50) {
                updatedOrder.isSuspicious = true;
                updatedOrder.riskScore = riskScore;
                await updatedOrder.save();

                await FraudLog.create({
                    userId: req.user._id,
                    orderId: updatedOrder._id,
                    riskScore: riskScore,
                    reasons: reasons
                });
            }
        }

        
        try {
            const io = socketConfig.getIO();
            io.to(id.toString()).emit('orderStatusUpdated', {
                orderId: updatedOrder._id,
                orderStatus: updatedOrder.orderStatus,
                updatedAt: updatedOrder.updatedAt
            });
            console.log(`📡 Real-time notification emitted for Order ${id}: Status -> ${updatedOrder.orderStatus}`);
        } catch (socketError) {
            console.error("Socket emission warning:", socketError.message);
        }

        
        res.status(200).json({
            success: true,
            message: "Order status successfully updated",
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};


exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user', 'name email')
            .populate('restaurant')
            .populate('deliveryPartner', 'name phone location currentWorkload');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};