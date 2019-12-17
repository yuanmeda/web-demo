/**
 * redis键值对服务器
 * 通过set和get来存储数据
 * session做数据持久化可以使用Redis数据库，可以实现数据共享
 */

const redis = require('redis')
const client = redis.createClient(6379, "locahost")

client.set('name', 'hello redis')

client.get('name',(err,val) => {
    console.log('redis get:', val)
})