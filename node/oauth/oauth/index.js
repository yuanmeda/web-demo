/**
 * github第三方登录测试
 * 1. 先到GitHub进行登记获取client_id和client_secret
 * 2. 使用client_id向GitHub获取授权码
 * 3. github 根据登记时配置的回调地址，带着授权码重定向到该地址
 * 4. 使用授权码、client_id和client_secret向GitHub获取授权令牌
 * 5. 使用授权令牌获取用户信息
 */

const Koa = require('koa')
const router = require('koa-router')()
const static = require('koa-static')
const app = new Koa();
const axios = require('axios')
const querystring = require('querystring')

app.use(static(__dirname + '/'));

//先到GitHub进行登记获取client_id和client_secret
const config = {
    client_id: '99b1c7a95787342a4e4a',
    client_secret: '3e5c4086f60db80eb8ddaa30df6577022999f4bc'
}
//使用client_id向GitHub获取授权码
router.get('/github/login', async (ctx) => {
    var dataStr = (new Date()).valueOf();
    //重定向到认证接口,并配置参数
    var path = "https://github.com/login/oauth/authorize";
    path += '?client_id=' + config.client_id;
    //转发到授权服务器
    ctx.redirect(path);
})

//github 根据登记时配置的回调地址(http://localhost:3000/github/oauth/callback)，带着授权码重定向到该地址
router.get('/github/oauth/callback', async (ctx) => {
    console.log('callback..')
    const code = ctx.query.code;
    const params = {
        client_id: config.client_id,
        client_secret: config.client_secret,
        code: code
    }
    //使用授权码、client_id和client_secret向GitHub获取授权令牌
    let res = await axios.post('https://github.com/login/oauth/access_token',
        params)
    const access_token = querystring.parse(res.data).access_token
    console.log(access_token)
    //使用授权令牌获取用户信息
    res = await axios.get('https://api.github.com/user?access_token=' +
        access_token)
    console.log('userAccess:', res.data)
    ctx.body = `
    <h1>Hello ${res.data.login}</h1>
    <img src="${res.data.avatar_url}" alt=""/>
    `
})
app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);