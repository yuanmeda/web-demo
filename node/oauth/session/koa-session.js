/**
 * 首次访问后，浏览器会收到一个cookie键值对
 * kakeba:sess =  eyJ2aWV3IjoyLCJfZXhwaXJlIjoxNTcwNjkyNzAzNTA2LCJfbWF4QWdlIjo4NjQwMDAwMH0=
 * 再次发送请求会携带此cookie值
 */

const Koa = require('koa')
const app = new Koa()
const session = require('koa-session')

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

app.use(ctx => {
    if(ctx.url == '/favicon.ico') return 

    //首次是一个空对象
    console.log(ctx.session)

    let n = ctx.session.view || 0
    ctx.session.view = ++n

    ctx.body = `第 ${n} 次 访问`
})

app.listen(3000)

