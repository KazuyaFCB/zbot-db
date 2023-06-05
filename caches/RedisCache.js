const Redis = require('redis');
const client = Redis.createClient({
    host: 'localhost',
    port: 6379,
    legacyMode: true
});

let connected = false;
client.on('connect', () => {
    console.log('Connected to Redis');
    connected = true;
});
client.on('error', (error) => {
    console.error(`Redis connection error: ${error}`);
    connected = false;
});

module.exports = {
    client,
    connectIfRedisIsNotConnected: async () => {
        if (!connected) {
            await client.connect();
        }
    }
}