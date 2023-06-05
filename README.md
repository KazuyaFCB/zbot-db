# zbot-db

## How to run project
- Clone from git
```
git clone https://github.com/KazuyaFCB/zbot-db.git
```
- Install packages
```
npm install
```
- Install Redis
```
docker pull redis
docker run -d --name some-redis -p 6379:6379 redis
docker ps -a
docker exec -it some-redis redis-cli
```
(some-redis is container name)
- Run project
```
node server
```

### How to test project
- Delete some keys of specific hash in Redis
```
docker exec -it some-redis redis-cli HDEL <HASH_NAME> <KEY_1> <KEY_2>
```
- Delete all keys of specific hash in Redis
```
docker exec -it some-redis redis-cli DEL <HASH_NAME>
```
- Delete all in Redis
```
docker exec -it some-redis redis-cli FLUSHALL
```
(some-redis is container name)