/**
 * koa-redis测试
 * 首先要安装Redis数据库，采用docker安装
 */

const redisStore = require('koa-redis');
const redis = require('redis')
const session = require('koa-session')
const redisClient = redis.createClient(6379, "localhost");


//包装后，可以直接使用ES7语法
var wrapper = require('co-redis');
var client = wrapper(redisClient);

app.keys = ['some secret key']

app.use(session({
    key: 'kkb:sess',
    store: redisStore({ client })
}, app));


app.use(ctx => {
    //...
    //查看redis中存储的数据
    redisClient.keys('*', (err, keys) => {
        console.log(keys);
        keys.forEach(key => {
            redisClient.get(key, (err, val) => {
                console.log(val);
            })
        })
    })
});

app.listen(3000)