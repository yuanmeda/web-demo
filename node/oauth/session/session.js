/**
 * session 测试
 * session是依赖Cookie实现的。session是服务器端对象
 * 自己的见解：session就是将用户的敏感信息存储在服务器中，通过将对应的sid保存在cookie中
 * 用户在发送请求时携带带有sid的cookie，服务器拿到sid，就可以得到相应的用户信息
 * session的局限性：在数据共享，跨域，集群服务器上难以施展
 * 解决方案：
 * 1. session 数据持久化，写入数据库或别的持久层。如Redis键值对数据库，这种方案的优点是架构清晰，缺点是工程量比较大。另外，持久层万一挂了，就会单点失败。
 * 2.JWT 一种方案是服务器索性不保存 session 数据了，所有数据都保存在客户端，每次请求都发回服务器。
 * 
 */

const http = require('http')

//新建服务器对象
const session = {}

http.createServer((req, res) => {
    if (req.url === '/favicon.ico') return

    console.log(req.headers.cookie)
    const sessionKey = 'sid'
    const cookie = req.headers.cookie

    // 如果有session
    if (cookie && cookie.indexOf(`${sessionKey}`) > -1) {
        res.end('Come Back！')
        //从cookie中提取sid,然后通过sid查询对应的用户数据
        const pattern = new RegExp(`${sessionKey}=([^;]+);?\s*`)
        const sid = pattern.exec(cookie)[1]
        console.log('session:', sid, session, session[sid])
    } else {
        const sid = (Math.random() * 9999999999).toFixed()
        res.setHeader('Set-Cookie', `${sessionKey}=${sid}`)
        //在服务器对象session中，根据索引sid来填充数据
        session[sid] = {
            name: 'zhongyuan'
        }
        res.end('第一次')
    }
    res.end('hello')
})
    .listen(3000)