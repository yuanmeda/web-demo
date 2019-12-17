/**
 * JWT鉴权
 * 通过对ctx.session的设置和删除来判断用户是否登录过
 * 服务器端操作
 */
const Koa = require('koa')
const app = new Koa()
const jwt = require('jsonwebtoken') //签名
const jwtAuth = require('koa-jwt') //验证
const bodyparser = require('koa-bodyparser')
const router = require('koa-router')()
const static = require('koa-static')

// 密钥
const secret = 'some secret'

app.use(bodyparser())
app.use(static(__dirname + '/'))

//登录，将用户信息作为负载写入token，返回token数据
router.post('/users/login-token', ctx => {
    const {body} = ctx.request

    ctx.body = {
        code: 200,
        user:  body.username,
        //token签名
        token: jwt.sign({
            data: body.username,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
        },secret),
        message:'登录成功'
    }
})

//中间件验证token信息
router.get('/users/getUser-token',jwtAuth({secret}), ctx => {
    ctx.body= {
        code: 200,
        username: ctx.state.user
    }
})


app.use(router.routes())

app.listen(3000)

