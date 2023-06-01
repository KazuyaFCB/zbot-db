require('dotenv').config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const userCache = require("./caches/UserCache");
const pricingCache = require("./caches/PricingCache");
const userRepository = require('./repositories/UserRepository');

const USER_PROTO_PATH = "./proto/user.proto";
const PRICING_PROTO_PATH = "./proto/pricing.proto";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};
const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, options);
const userProto = grpc.loadPackageDefinition(userPackageDefinition);

const pricingPackageDefinition = protoLoader.loadSync(PRICING_PROTO_PATH, options);
const pricingProto = grpc.loadPackageDefinition(pricingPackageDefinition);

const server = new grpc.Server();

server.addService(userProto.UserRepository.service, {
    findAllUsers: async (_, callback) => {
        try {
            const users = await userRepository.findAllUsers();
            callback(null, {
                "users": users
            });
        } catch (error) {
            callback(error, null);
        }
    },
    findOneUserByPhoneNumber: async (_, callback) => {
        try {
            const request = { ..._.request };
            const user = await userCache.findOneUserByPhoneNumber(request.phoneNumber);
            callback(null, {
                "user": user
            });
        } catch (error) {
            callback(error, null);
        }
    },
    updateUserByPhoneNumberAndExtendedMonth: async (_, callback) => {
        try {
            const request = { ..._.request };
            await userCache.updateUserByPhoneNumberAndExtendedMonth(request.updatedUsers)
            callback(null, {});
        } catch (error) {
            callback(error, null);
        }
    },
});

server.addService(pricingProto.PricingRepository.service, {
    findAllPricings: async (_, callback) => {
        try {
            const pricings = await pricingCache.findAllPricings();
            callback(null, {
                "pricings": pricings
            });
        } catch (error) {
            callback(error, null);
        }
    },
    findOnePricingByPrice: async (_, callback) => {
        try {
            const request = { ..._.request };
            const pricing = await pricingCache.findOnePricingByPrice(request.price);
            callback(null, {
                "pricing": pricing
            });
        } catch (error) {
            callback(error, null);
        }
    }
});

server.bindAsync(
    process.env.GRPC_HOSTNAME,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        console.log(`Server running at ${process.env.GRPC_HOSTNAME}`);
        server.start();
    }
);
