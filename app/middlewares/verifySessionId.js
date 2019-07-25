const user_col = require('./../models/user')

module.exports = async (ctx, next) => {
  const { sessionId } = ctx.request.body
  const urlList = ['/api/login', '/api/register', '/api/loginOut']
  if (!urlList.includes(ctx.url)) {
    if (!ctx.session.userInfo) {
      return ctx.success({ msg: '登录过期', code: '200000' })
    }
    if (ctx.session.userInfo.sessionId !== sessionId) {
      return ctx.success({ msg: '登录信息错误', code: '210000' })
    }
    let user = ctx.session.userInfo.user
    let userResult = await user_col.findOne({ user })
    if (!userResult) {
      return ctx.success({ msg: '账号不存在', code: '000002' })
    }
    if (userResult.delete === 1) {
      return ctx.success({ msg: '账号已被删除', code: '000005' })
    }
    if (userResult.status === 0) {
      return ctx.success({ msg: '账号已被禁用', code: '000006' })
    }
  }
  await next()
}
