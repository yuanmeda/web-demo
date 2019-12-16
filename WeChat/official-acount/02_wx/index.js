/**
 * 网页授权
 * 
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
    refresh_token: "REFRESH_TOKEN",
    expires_in: 7200
}

const OAuth = require('co-wechat-oauth')
const oauth = new OAuth(conf.appid, conf.appsecret,
    openid => tokenCache.access_token,
    (openid, token) => tokenCache.access_token = token
)

/**
 * 点击微信登录，生成并重定向到微信网页授权页面
 */
router.get('/wxAuthorize', async ctx => {
    const state = ctx.query.id
    //配置同意授权后的回调地址：
    const redirectUrl = ctx.href.replace('wxAuthorize', 'wxCallback')
    // 具体api参数信息：http://doxmate.cool/node-webot/co-wechat-oauth/api.html
    const oauthUrl = oauth.getAuthorizeURL(redirectUrl, state, 'snsapi_userinfo')
    console.log(oauthUrl)
    ctx.redirect(oauthUrl)
})

/**
 * 用于授权页面点击同意后，微信重定向请求
 * 请求URL中携带code信息，用于授权认证
 */
router.get('/wxCallback', async ctx => {
    const code = ctx.query.code
    const token = await oauth.getAccessToken(code)
    const openid = token.data.openid
    console.log('token', token.data)
    console.log('accessToken', token.data.access_token)
    ctx.redirect(`/?openid=${openid}`)
})

/**
 * 获取用户信息
 */
router.get('/getUser', async ctx => {
    const openid = ctx.query.openid
    const userInfo = await oauth.getUser(openid)
    ctx.body = userInfo
})

/**
 * 获取JSConfig
 */

const WechatAPI = require('co-wechat-api')
const api = new WechatAPI(
    conf.appid,
    conf.appsecret,
    // 取Token回调 这里可以扩展从数据库中取token
    () => tokenCache.access_token,
    // 存Token
    token => tokenCache.access_token = token
)
// api链接：http://doxmate.cool/node-webot/co-wechat-api/api.html#api_js_exports_getJsConfig
router.get('/getJsConfig',async ctx => {
    console.log('getJSSDK...',ctx.query)
    const res = await api.getJsConfig(ctx.query)
    ctx.body = res
})

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);