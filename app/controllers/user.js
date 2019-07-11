const passport = require('./../utils/passpot')
const user_col = require('./../models/user')
const password_col = require('./../models/password')

const register = async (ctx, next) => {
  const { userName, password } = ctx.request.body
  if (!userName || !password) {
    ctx.throw(400, '缺少参数')
  }
  const userArr = await user_col.find()
  const userLength = userArr.length
  if (userArr.find(item => item.userName === userName)) {
    return ctx.success({ msg: '账号已存在', code: '000001' })
  }
  const userId = userLength + 1
  const newUser = await user_col.create({
    userId, userName, createTime: ctx.formatDate()
  })
  if (newUser) {
    const result = await password_col.create({ userId, password })
    if (result) {
      return ctx.success({ msg: '注册成功', code: '000000' })
    }
  }
}

const login = async (ctx, next) => {
  let { userName, password, ipAddress, operatingSystem, terminal } = ctx.request.body
  if (!operatingSystem || !terminal || !userName || !password || !ipAddress) {
    ctx.throw(400, '缺少参数')
  }
  let userResult = await user_col.findOne({ userName })
  if (!userResult) {
    return ctx.success({ msg: '账号不存在', code: '000002' })
  }
  if (userResult.delete === 1) {
    return ctx.success({ msg: '账号已被删除', code: '000005' })
  }
  let { userId, errorCount, errorTime } = userResult
  if (errorCount === 3) {
    let timeDiff = ((new Date().getTime() - new Date(errorTime).getTime())/1000/60).toFixed(0)
    if (timeDiff < 1) {
      console.log(333, timeDiff)
      return ctx.success({ msg: '账号已被锁定', code: '000004' })
    }
    errorCount = 0
  }
  let passwordResult = await password_col.findOne({ userId })
  if (passwordResult.password !== password) {
    await user_col.update({ userId }, {
      $set: {
        errorCount: errorCount === 3 ? 3 : errorCount + 1, errorTime: ctx.formatDate()
      }
    })
    if (errorCount === 3) {
      return ctx.success({ msg: '账号已被锁定', code: '000004' })
    }
    return ctx.success({ msg: '账号密码不正确', code: '000003' })
  }
  let result = await user_col.update({ userId }, {
    $set: {
      ipAddress, operatingSystem, terminal, loginTime: ctx.formatDate(), errorCount: 0
    }
  })
  if (result) {
    return ctx.success({ msg: '登录成功' })
  }
}

module.exports = {
  register, login
}
