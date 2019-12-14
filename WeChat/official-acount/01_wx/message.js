/**
 * 公众号收发信息
 * 测试：微信关注测试龚公众号之后，发送消息进行测试
 * 发送1，回复Hello 1
 */
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')

const app = new Koa()
const router = new Router()
app.use(static(__dirname + '/'))


//收发信息
const xml2js = require('xml2js')
const xmlParser = require('koa-xml-body')// 微信数据是以xml的格式发送的，这个类似body-parser
app.use(xmlParser())
router.post('/wechat', ctx => {
    const {
        xml: msg
    } = ctx.request.body
    console.log('Receive:', msg)
    const builder = new xml2js.Builder()
    const result = builder.buildObject({
        xml: {
            ToUserName: msg.FromUserName,
            FromUserName: msg.ToUserName,
            CreateTime: Date.now(),
            MsgType: msg.MsgType,
            Content: 'Hello ' + msg.Content
        }
    })
    ctx.body = result
})

// 还可以用co-wechat实现
const wechat = require('co-wechat')
const bodyParser = require('koa-bodyparser');
app.use(bodyParser())
const conf = require('./conf')

router.all('/wechat', wechat(conf).middleware(
    async message => {
        console.log('wechart', message)
        return 'Hello world! ' + message.Content
    }
))

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);