var pricingModel = require('../models/PricingModel');

module.exports = {
  findAllPricings: async () => {
    try {
      let result = await pricingModel.findAll(
        {
          order: [['price', 'ASC']]
        }
      );
      var pricingList = result.map(pricingItem => pricingItem.dataValues);
      return pricingList;
    } catch (error) {
      console.error(`#PricingRepository :: #findAllPricings :: 
        Error :: ${error}`);
      throw error;
    }
  },

  findOnePricingByPrice: async (price) => {
    try {
      var result = await pricingModel.findOne(
        {
          where: {
            price: price
          },
          attributes: ['price', 'extendedMonth']
        }
      );
      if (result === null) return null;
      return result.dataValues;
    } catch (error) {
      console.error(`#PricingRepository :: #findOnePricingByPrice ::
        price: ${price} :: 
        Error :: ${error}`);
      throw error;
    }
  }
}