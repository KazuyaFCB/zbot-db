const NodeCache = require('node-cache');
const pricingRepository = require('../repositories/PricingRepository');
const pricingCache = new NodeCache();

module.exports = {
    findAllPricings: async () => {
        let pricings = pricingCache.get("pricingList");
        if (pricings === undefined) {
            pricings = await pricingRepository.findAllPricings();
        }
        const isSuccess = pricingCache.set("pricingList", pricings);
        if (!isSuccess) {
            console.log(`Cannot cache pricingList to memory`);
        }
        return pricings;
    },

    findOnePricingByPrice: async (price) => {
        let pricing = pricingCache.get(price);
        if (pricing === undefined) {
            pricing = await pricingRepository.findOnePricingByPrice(price);
        }
        const isSuccess = pricingCache.set(price, pricing);
        if (!isSuccess) {
            console.log(`Cannot cache ${price} to memory`);
        }
        return pricing;
    }
}