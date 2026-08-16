const Order = require('../models/order.js'); 

const evaluateOrderRisk = async (userId) => {
  let riskScore = 0;
  let reasons = [];

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  
  const recentOrdersCount = await Order.countDocuments({
    user: userId,
    createdAt: { $gte: tenMinutesAgo }
  });

  if (recentOrdersCount >= 3) {
    riskScore += 40;
    reasons.push("Multiple orders placed in a very short period.");
  }

  
  const recentCancellations = await Order.countDocuments({
    user: userId,
    status: 'Cancelled', 
    updatedAt: { $gte: tenMinutesAgo }
  });

  if (recentCancellations >= 2) {
    riskScore += 50;
    reasons.push("Repeated order cancellations detected.");
  }

  return { riskScore, reasons };
};

module.exports = { evaluateOrderRisk };