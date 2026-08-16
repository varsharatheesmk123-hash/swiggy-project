const User = require('../models/user.js');

exports.setDeliveryStatus = async (req, res) => {
    try {
        const { isAvailable, coordinates } = req.body; 

        
        if (req.user.role !== 'deliveryPartner' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only delivery partners can update availability status.'
            });
        }

        const updateData = {};

        if (typeof isAvailable === 'boolean') {
            updateData.isAvailable = isAvailable;
        }

        if (coordinates) {
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid coordinates format. Expected [longitude, latitude].'
                });
            }

            updateData.location = {
                type: 'Point',
                coordinates: coordinates 
            };
        }

        const partner = await User.findByIdAndUpdate(
            req.user._id, 
            updateData,
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Delivery partner status updated successfully',
            data: partner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update delivery status',
            error: error.message
        });
    }
};