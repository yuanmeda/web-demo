
目录

- [了解微信公众号](#1)
    - [公众号的种类及入口](#1.1)
    - [申请自己的公众号](#1.1)
    - [成为开发者](#1.1)
- [测试账号开通与配置](#2)
    - [安装sunny-ngrok实现外网映射](#2.1)
    - [编写接口验证微信服务器完成配置](#2.2)
- [消息回复](#3)
- [调用微信服务端api](#4)


## <span id="1">了解微信公众号</span>
- 公众号的种类及入口
- 申请自己的公众号
- 成为开发者

详情参阅：
[公众号简介与开发者申请](https://note.youdao.com/)

## <span id="2">测试账号开通与配置</span>
无需申请公众账号，可在测试账号中体验并测试微信公众平台所有高级接口

在进⾏公众号开发时，通常会先在测试账号中进⾏开发调试，经测试确认⽆误后，再把新功能切换到正式账号

[测试账号配置使用参考文档](https://blog.csdn.net/hzw2312/article/details/69664485)

#### <span id="2.1">安装sunny-ngrok实现外网映射</span>
详情参阅：
[sunny-ngrok使用](https://note.youdao.com/)

启动ngrok后，申请好的域名就可以作为JS接口安全域名啦

http://cococoupler.free.idcfengye.com 将映射为127.0.0.1:3000

#### <span id="2.2">编写接口验证微信服务器完成配置</span>
此时测试账号接口配置信息如下：

URL：http://cococoupler.free.idcfengye.com/wechat

Token：coco_coupler_zy_zsx

注意点击提交前，都还没有配置成功

这个配置是提供给我们验证微信的！只有我和微信知道token信息，因此

具体原理过程：
1. 点击提交，微信会向我们配置的URL发送请求，请求携带四个参数
- signature, // 微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参
数、nonce三个参数按照某种排序后进行sh1算法得到
- timestamp, // 时间戳
- nonce, // 随机数
- echostr // 随机字符串
2. 开发者服务端接受请求后，用自己的token和微信传来的timestamp、nonce进行同样的算法，得到一个签名
3. 对比这个签名和参数signature
4. 如果相同，则验证微信成功，返回echostr即可

创建服务器代码
```
// source.js
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

```
到此为止，测试账号配置完成

## <span id="3">消息回复</span>

用户关注公众号之后，可以给公众号发送消息

编写相应的接口响应用户信息

新建message.js
```
// 微信数据传输使用xml格式，所以需要做相关处理
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

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);

```

使用工具库co-wechat实现

```
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')

const app = new Koa()
const router = new Router()
app.use(static(__dirname + '/'))

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
```
测试步骤：

1. 开启服务：nodemon message.js
2. 打开微信扫一扫测试号我二维码，关注
3. 发送消息，查看自动回复消息

## <span id="4">调用微信服务端api</span>

[微信开发api文档](https://developers.weixin.qq.com/doc/offiaccount/User_Management/Getting_a_User_List.html)

```
/**
 * index.js
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

//获取access token
router.get('/getAccessToken', async ctx => {
    const host = 'https://api.weixin.qq.com'
    const path = '/cgi-bin/token'
    const params = `?grant_type=client_credential&appid=${conf.appid}&secret=${conf.appsecret}`
    const url = host + path + params
    const res = await axios.get(url)
    Object.assign(tokenCache, res.data, {
        updateTime: Date.now()
    })
    ctx.body = res.data
})

// 获取关注此公众号的用户列表
// https://developers.weixin.qq.com/doc/offiaccount/User_Management/Getting_a_User_List.html
router.get('/getFollowers', async ctx => {
    const url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${tokenCache.access_token}`
    const res = await axios.get(url)
    console.log('getFollowers:', res)
    ctx.body = res.data
})

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);

```
index.html

```
 <div id="app">
        <cube-button @click='getTokens'>getAccessToken</cube-button>
        <cube-button @click='getFollowers'>getFollowers</cube-button>

    </div>
    <script>
        var app = new Vue({
            el: '#app',
            methods: {
                async getTokens(){
                    const res = await axios.get('/getAccessToken')
                    console.log('res:',res)
                },
                async getFollowers(){
                    const res = await axios.get('/getFollowers')
                    console.log('res',res)
                }
            }
        });
    </script>

```
配合使用工具库co-wechat-api

```
// 在inde.js基础上修改

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

```