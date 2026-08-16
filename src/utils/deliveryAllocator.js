const assignDeliveryPartner = async (orderId) => {
  console.log(`Delivery partner assigned for order: ${orderId}`);
  return { 
    status: 'Assigned', 
    partnerId: 'DELIVERY_PARTNER_123',
    name: 'Ramesh Kumar'
  };
};

const allocateDeliveryPartner = assignDeliveryPartner;

const calculateSurgeFeeInternal = async (city) => {
  return 40;
};


module.exports = { 
  assignDeliveryPartner,
  allocateDeliveryPartner,
  calculateSurgeFeeInternal 
};