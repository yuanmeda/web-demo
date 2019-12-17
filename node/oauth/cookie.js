/**
 * cookie测试
 * 内存cookie：不设置过期时间默认是存在浏览器的内存中，浏览器关闭后自动清除
 * 硬盘cookie：是指在你设置了cookie的Expires属性（即过期时间），此时cookie将保存到你的硬盘上，过期时间到了会自动清除或者手动清除
 */

const http = require('http')

http.createServer((req, res) => {
    if (req.url === '/favicon.ico') return

    console.log(req.headers.cookie)

    // cookie设置过期时间后，浏览器会在30秒后自动清除
    let exp = new Date();
    exp.setTime(exp.getTime() + 60 * 1000);//过期时间60秒
    res.setHeader('Set-Cookie', 'cookie1=a;expires=' + exp.toGMTString())

    //不设置cookie过期时间 浏览器关闭后自动清除
    // res.setHeader('Set-Cookie', 'cookie1=a')
    res.end('hello')
})
    .listen(3000)