const passport = require('./../utils/passpot')
const user_col = require('./../models/user')
const menu_col = require('./../models/menu')
const password_col = require('./../models/password')

// 注册、新增用户
const register = async (ctx, next) => {
  const { user, userName, password, operator } = ctx.request.body
  if (!user || !userName || !password) {
    ctx.throw(400, '缺少参数')
  }
  const userArr = await user_col.find()
  const userLength = userArr.length
  if (userArr.find(item => item.user === user)) {
    return ctx.success({ msg: '账号已存在', code: '000001' })
  }
  const userId = userLength + 1
  const newUser = await user_col.create({
    userId, user, userName, operator, createTime: ctx.formatDate()
  })
  if (newUser) {
    const result = await password_col.create({ userId, password })
    if (result) {
      return ctx.success({ msg: '注册成功', code: '000000' })
    }
  }
}

const login = async (ctx, next) => {
  let { user, password, ipAddress, operatingSystem, terminal } = ctx.request.body
  if (!operatingSystem || !terminal || !user || !password) {
    ctx.throw(400, '缺少参数')
  }
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
  let { userId, errorCount, errorTime, userName } = userResult
  if (errorCount === 3) {
    let timeDiff = ((new Date().getTime() - new Date(errorTime).getTime())/1000/60).toFixed(0)
    if (timeDiff < 1) {
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
    return ctx.success({ msg: '登录成功', data: { userId, user, userName } })
  }
}

const getUser = async (ctx, next) => {
  let { userId, name, account, status } = ctx.request.body
  if (!userId) {
    return ctx.loginFail()
  }
  let search = {}
  name && (search.userName = name)
  account && (search.user = account)
  status !== undefined && (search.status = status)
  let result = await user_col.find(search)
  result = result.map(item => {
    let obj = JSON.parse(JSON.stringify(item))
    obj.name = item.userName
    obj.account = item.user
    return obj
  })
  ctx.success({ data: { list: result } })
}

const menu = async (ctx, next) => {
  let { userId, menuName, status } = ctx.request.body
  if (!userId) {
    return ctx.loginFail()
  }
  let search = {}
  menuName && (search.menuName = menuName)
  status !== undefined && (search.status = status)
  search.delete = 0
  let result = await menu_col.find(search)
  ctx.success({ data: { list: result } })
}

// 获取字段
const field = async (ctx, next) => {
  let { userId } = ctx.request.body
  if (!userId) {
    return ctx.loginFail()
  }
  ctx.success()
}

const modifyPassword = async (ctx, next) => {
  let { userId, password, newPassword } = ctx.request.body
  let result = await password_col.findOne({ userId })
  if (result.password !== password) {
    return ctx.success({ msg: '原密码不正确', code: '999999' })
  }
  await password_col.update({ userId }, {
    $set: {
      password: newPassword, modifyTime: ctx.formatDate()
    }
  })
  ctx.success({ msg: '修改成功' })
}

const loginOut = async (ctx, next) => {
  let { userId } = ctx.request.body
  if (!userId) {
    return ctx.loginFail()
  }
  ctx.success()
}

// 编辑用户信息
const modifyUserInfo = async (ctx, next) => {
  let { userId, id, account, name, password, status, operator } = ctx.request.body
  if (!userId || account) {
    ctx.throw(400, '缺少参数')
  }
  let result = await user_col.find({ user: account })
  if (result.length > 0 && result[0].userId !== id) {
    return ctx.success({ code: '000001', msg: '账号已存在' })
  }
  let search = { user: account, userName: name, status, operator }
  if (!account) delete search.user
  if (!name) delete search.userName
  await user_col.findOneAndUpdate({ id }, search, () => {
    if (password) return false
    ctx.success()
  })
  password && await password_col.findOneAndUpdate({ id }, { password }, () => {
    ctx.success()
  })
}

// 删除账号
const deleteUser = async (ctx, next) => {
  let { id } = ctx.request.body
  if (id.includes(1)) {
    return ctx.success({ msg: '超级管理员不能删除', code: '000001' })
  }
  await user_col.remove({ userId: { $in: id } })
  await user_col.remove({ userId: { $in: id } }, () => {
    ctx.success()
  })
}

module.exports = {
  register, login, menu, field, loginOut, modifyPassword, getUser, modifyUserInfo, deleteUser
}
