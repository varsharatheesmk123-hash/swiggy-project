const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        cuisines: {
           type: [String], 
           default: [],
        },
        costForTwo: {
           type: Number, 
           default: 0,
        },
        deliveryTime: {
           type: Number, 
           default: 30,
        },
        isVeg: {
           type: Boolean, 
           default: false,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], 
                required: true
            }
        }
    },
    { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisines: 'text' });
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);