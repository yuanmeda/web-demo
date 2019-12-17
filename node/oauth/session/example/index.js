/**
 * 登录鉴权
 * 通过对ctx.session的设置和删除来判断用户是否登录过
 * 服务器端操作
 */
const Koa = require('koa')
const app = new Koa()
const session = require('koa-session')
const bodyparser = require('koa-bodyparser')
const router = require('koa-router')()
const static = require('koa-static')

// 加密私钥
app.keys = ['some secret key']

// session配置
const CONFIG = {
    key: 'kakeba:sess',
    maxAge: 86400000,
    httpOnly: true,
    signed: true
}

app.use(session(CONFIG, app))
app.use(bodyparser())
app.use(static(__dirname + '/'))

//登录，将用户信息写入session中，返回cookie
router.post('/users/login', ctx => {
    const {body} = ctx.request

    ctx.session.userInfo = body.username

    ctx.body = {
        code: 200,
        message:'登录成功'
    }

})

//中间件判断用户是否登录
router.get('/users/getUser',require('./isLogin'), ctx => {
    ctx.body= {
        code: 200,
        username: ctx.session.userInfo
    }
})

router.post('/users/logout', ctx => {

    delete ctx.session.userInfo

    ctx.body = {
        code:200,
        message: '登出成功'
    }
})

app.use(router.routes())

app.listen(3000)

