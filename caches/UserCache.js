const redisCache = require('./RedisCache');
const userRepository = require('../repositories/UserRepository');

const USER_HASH_NAME = "user";

module.exports = {
    findAllUsers: async () => {
        let users;
        try {
            await redisCache.connectIfRedisIsNotConnected();

            users = await new Promise((resolve, reject) => {
                redisCache.client.hGet(USER_HASH_NAME, "userList", async (error, users) => {
                    if (error) {
                        console.error(`#UserCache :: #findAllUsers ::
                            Cannot get userList from Redis :: 
                            Error :: ${error}`);
                        resolve(undefined);
                    }
                    if (users === null) {
                        resolve(undefined);
                    }
                    resolve(JSON.parse(users));
                });
            });
        } catch (error) {
            console.error(`#UserCache :: #findAllUsers ::
                Cannot get userList from Redis :: 
                Error :: ${error}`);
            users = undefined;
        }

        if (users === undefined) {
            users = await userRepository.findAllUsers();
            await new Promise((resolve, reject) => {
                redisCache.client.hSet(USER_HASH_NAME, "userList", JSON.stringify(users), (error) => {
                    if (error) {
                        console.error(`#UserCache :: #findAllUsers ::
                            Cannot set userList to Redis :: 
                            Error :: ${error}`);
                    }
                    resolve();
                });
            });
        }

        return users;
    },
    findOneUserByPhoneNumber: async (phoneNumber) => {
        let user;
        try {
            await redisCache.connectIfRedisIsNotConnected();

            user = await new Promise((resolve, reject) => {
                redisCache.client.hGet(USER_HASH_NAME, phoneNumber, async (error, user) => {
                    if (error) {
                        console.error(`#UserCache :: #findOneUserByPhoneNumber ::
                            Cannot get phoneNumber: ${phoneNumber} from Redis :: 
                            Error :: ${error}`);
                        resolve(undefined);
                    }
                    if (user === null) { // Key không tồn tại trong Redis
                        /* vì user là string, nên nếu tồn tại 
                            nhưng là kq của lần query not found trước thì user = "null" */
                        resolve(undefined);
                    }
                    resolve(JSON.parse(user));
                });
            });
        } catch (error) {
            console.error(`#UserCache :: #findOneUserByPhoneNumber ::
                Cannot get phoneNumber: ${phoneNumber} from Redis :: 
                Error :: ${error}`);
            user = undefined;
        }

        if (user === undefined) {
            user = await userRepository.findOneUserByPhoneNumber(phoneNumber);
            await new Promise((resolve, reject) => {
                redisCache.client.hSet(USER_HASH_NAME, phoneNumber, JSON.stringify(user), (error) => {
                    if (error) {
                        console.error(`#UserCache :: #findOneUserByPhoneNumber ::
                            Cannot set phoneNumber: ${phoneNumber} to Redis :: 
                            Error :: ${error}`);
                    }
                    resolve();
                });
            });
        }

        return user;
    },
    updateUserByPhoneNumberAndExtendedMonth: async (updatedUsers) => {
        try {
            await redisCache.connectIfRedisIsNotConnected();
            await userRepository.updateUserByPhoneNumberAndExtendedMonth(updatedUsers);
        } catch (error) {
            console.error(`#UserCache :: #updateUserByPhoneNumberAndExtendedMonth ::
                Cannot updateUserByPhoneNumberAndExtendedMonth :: updatedUsers: ${updatedUsers} :: 
                Error :: ${error}`);
            throw error;
        }

        // Tạo mảng chứa danh sách các phoneNumber cần xóa
        const phoneNumbersToDelete = updatedUsers.map(updatedUser => updatedUser.phoneNumber);

        // Xóa các key trong Redis
        await new Promise((resolve, reject) => {
            redisCache.client.hDel(USER_HASH_NAME, phoneNumbersToDelete, (error, result) => {
                if (error) {
                    console.error(`#UserCache :: #updateUserByPhoneNumberAndExtendedMonth ::
                        Cannot delete phoneNumbers: ${phoneNumbersToDelete} from Redis :: 
                        Error :: ${error}`);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
        await new Promise((resolve, reject) => {
            redisCache.client.hDel(USER_HASH_NAME, "userList", (error, result) => {
                if (error) {
                    console.error(`#UserCache :: #updateUserByPhoneNumberAndExtendedMonth ::
                        Cannot delete userList from Redis :: 
                        Error :: ${error}`);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}
