/**
 * JWT原理：
 * Bearer Token包含三个组成部分：令牌头、payload、哈希
 * token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoiYWJjIiwicGFzc3dv
cmQiOiIxMTExMTEifSwiZXhwIjoxNTQ2OTQyMzk1LCJpYXQiOjE1NDY5Mzg3OTV9.VPBCQgLB7XPBq3RdHK9WQM
kPp3dw65JzEKm_LZZjP9Y
 * 1. 签名：默认使用base64对令牌头和payload进行编码，使用hs256算法对（令牌头、payload和密钥）进行签名生成哈希
 * 2. 验证：默认使用hs256算法对令牌中数据签名并将结果和令牌中哈希比对
 */ 

const jsonwebtoken = require('jsonwebtoken')

//密钥
const secret = '12345678'

//token中存放用户相关信息，最好不要存放敏感信息
const user = {
  username: 'zhongyuan',
  password: '12345'
}

//默认使用HMAC SHA256算法，简称HS256
const token = jsonwebtoken.sign({
  data: user,
  // 设置 token 过期时间
  exp: Math.floor(Date.now() / 1000) + (60 * 60), 
}, secret)

console.log('生成token:' + token)
console.log('解码:', jsonwebtoken.verify(token, secret))
