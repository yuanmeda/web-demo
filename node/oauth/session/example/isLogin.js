module.exports = async (ctx, next) => {
    if(ctx.session && ctx.session.userInfo){
       await next()
    }else{
        ctx.body ={
            code: 401,
            message: '登录失败！'
        }
    }
}