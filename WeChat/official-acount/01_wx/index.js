/**
 * 调用微信端api
 * 调用其他接口都需要携带access token
 */

const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser');
const app = new Koa()
const conf = require('./conf')
app.use(bodyParser())
const router = new Router()
app.use(static(__dirname + '/'))
const axios = require('axios')


const tokenCache = {
    access_token: '',
    updateTime: Date.now(),
    expires_in: 7200
}

// //获取access token
// router.get('/getAccessToken', async ctx => {
//     const host = 'https://api.weixin.qq.com'
//     const path = '/cgi-bin/token'
//     const params = `?grant_type=client_credential&appid=${conf.appid}&secret=${conf.appsecret}`
//     const url = host + path + params
//     const res = await axios.get(url)
//     Object.assign(tokenCache, res.data, {
//         updateTime: Date.now()
//     })
//     ctx.body = res.data
// })

// // 获取关注此公众号的用户列表
// // https://developers.weixin.qq.com/doc/offiaccount/User_Management/Getting_a_User_List.html
// router.get('/getFollowers', async ctx => {
//     const url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${tokenCache.access_token}`
//     const res = await axios.get(url)
//     console.log('getFollowers:', res)
//     ctx.body = res.data
// })

const WechatAPI = require('co-wechat-api')
const api = new WechatAPI(
    conf.appid,
    conf.appsecret,
    // 取Token回调 这里可以扩展从数据库中取token
    () => tokenCache.access_token,
    // 存Token
    token => tokenCache.access_token = token
)
router.get('/getFollowers', async ctx => {
    let res = await api.getFollowers()
    console.log(res.data)
    res = await api.batchGetUsers(res.data.openid, 'zh_CN')
    ctx.body = res
})


app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);