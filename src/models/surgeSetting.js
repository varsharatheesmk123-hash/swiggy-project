const mongoose = require('mongoose');

const surgeSettingsSchema = new mongoose.Schema(
    {
        baseDeliveryFee: {
            type: Number,
            required: true,
            default: 40
        },
        peakHours: [
            {
                startHour: { type: Number, required: true }, 
                endHour: { type: Number, required: true },   
                multiplier: { type: Number, required: true, default: 1.5 }
            }
        ],
        highDemandRegions: [
            {
                city: { type: String, required: true },
                isHighDemand: { type: Boolean, default: false },
                regionalMultiplier: { type: Number, default: 1.2 }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('SurgeSettings', surgeSettingsSchema);