const redisCache = require('./RedisCache');
const pricingRepository = require('../repositories/PricingRepository');

const PRICING_HASH_NAME = "pricing";

module.exports = {
    findAllPricings: async () => {
        let pricings;
        try {
            await redisCache.connectIfRedisIsNotConnected();

            pricings = await new Promise((resolve, reject) => {
                redisCache.client.hGet(PRICING_HASH_NAME, "pricingList", async (error, pricings) => {
                    if (error) {
                        console.error(`#PricingCache :: #findAllPricings ::
                            Cannot get pricingList from Redis :: 
                            Error :: ${error}`);
                        resolve(undefined);
                    }
                    if (pricings === null) {
                        resolve(undefined);
                    }
                    resolve(JSON.parse(pricings));
                });
            });
        } catch (error) {
            console.error(`#PricingCache :: #findAllPricings ::
                Cannot get pricingList from Redis :: 
                Error :: ${error}`);
            pricings = undefined;
        }

        if (pricings === undefined) {
            pricings = await pricingRepository.findAllPricings();
            await new Promise((resolve, reject) => {
                redisCache.client.hSet(PRICING_HASH_NAME, "pricingList", JSON.stringify(pricings), (error) => {
                    if (error) {
                        console.error(`#PricingCache :: #findAllPricings ::
                            Cannot set pricingList to Redis :: 
                            Error :: ${error}`);
                    }
                    resolve();
                });
            });
        }

        return pricings;
    },

    findOnePricingByPrice: async (price) => {
        let pricing;
        try {
            await redisCache.connectIfRedisIsNotConnected();

            pricing = await new Promise((resolve, reject) => {
                redisCache.client.hGet(PRICING_HASH_NAME, price, async (error, pricing) => {
                    if (error) {
                        console.error(`#PricingCache :: #findOnePricingByPrice ::
                            Cannot get price: ${price} from Redis :: 
                            Error :: ${error}`);
                        resolve(undefined);
                    }
                    if (pricing === null) {
                        resolve(undefined);
                    }
                    resolve(JSON.parse(pricing));
                });
            });
        } catch (error) {
            console.error(`#PricingCache :: #findOnePricingByPrice ::
                Cannot get price: ${price} from Redis :: 
                Error :: ${error}`);
            pricing = undefined;
        }

        if (pricing === undefined) {
            pricing = await pricingRepository.findOnePricingByPrice(price);
            await new Promise((resolve, reject) => {
                redisCache.client.hSet(PRICING_HASH_NAME, price, JSON.stringify(pricing), (error) => {
                    if (error) {
                        console.error(`#PricingCache :: #findOnePricingByPrice ::
                            Cannot set price: ${price} to Redis :: 
                            Error :: ${error}`);
                    }
                    resolve();
                });
            });
        }

        return pricing;
    }
}