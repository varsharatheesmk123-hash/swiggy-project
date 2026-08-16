const mongoose = require('mongoose');
const restaurant = require('./restaurant');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant    : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalamount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {    
    type: String,
    enum: [
        'Pending', 
        'confirmed', 
        'Out for Delivery', 
        'Delivered', 
        'Cancelled'],
    default: 'Pending'
  },
deliveryAddress: {
    type: String,
    required: true
  },
isSuspicious: {
  type: Boolean,
  default: false
},
riskScore: {
  type: Number,
  default: 0
}

}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);  