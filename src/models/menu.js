const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
        },
        isveg: {
            type: Boolean,
            default: false,
        },
        isavailable: {
            type: Boolean,
            default: true,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model('Menu', menuSchema);
