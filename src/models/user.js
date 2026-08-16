const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'restaurant', 'deliveryPartner'], 
            default: 'user',
        },
        isblocked: {
            type: Boolean,
            default: false,
        }, 
        isRestricted: {
            type: Boolean,
            default: false
        },     
        isAvailable: {
            type: Boolean,
            default: false
        },
        currentWorkload: {
            type: Number,
            default: 0
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], 
                index: '2dsphere' 
            }
        },
        preferences: {
            favoriteCuisines: [{ type: String }],
            favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }]
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);