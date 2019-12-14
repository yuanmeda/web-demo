/**
 * 此接口用于，点击测试账号接口配置中的提交
 * 决定是否配置成功
 */

const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const xml2js = require('xml2js')
const url = require('url')
const conf = require('./conf')
const crypto = require('crypto')
const xmlParser = require('koa-xml-body')

const app = new Koa()
app.use(xmlParser())
const router = new Router()
app.use(static(__dirname + '/'))

// 微信端通过发送请求http://cococoupler.free.idcfengye.com/wechat 开发者拿到参数进行微信身份验证
// 利用token验证微信
// 测试账号提交接口配置的时候会调用此接口
router.get('/wechat', ctx => {
    console.log('微信认证...', ctx.url)
    const {query} = url.parse(ctx.url,true)
    const {
        signature, // 微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参数、nonce参数。
        timestamp, // 时间戳
        nonce, // 随机数
        echostr // 随机字符串
    } = query
    console.log('wechat', query)
    let str = [conf.token, timestamp, nonce].sort().join('')
    let strSha1 = crypto.createHash('sha1').update(str).digest('hex')
    console.log(`自己加密后的字符串为：${strSha1}`)
    console.log(`微信传入的加密字符串为：${signature}`)
    console.log(`两者比较结果为：${signature == strSha1}`)
     // 签名对比，相同则按照微信要求返回echostr参数值
     if (signature == strSha1) {
        ctx.body = echostr
    } else {
        ctx.body = "你不是微信"
    }
})

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);