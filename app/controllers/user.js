const md5 = require('md5')
const passport = require('./../utils/passpot')
const user_col = require('./../models/user')
const menu_col = require('./../models/menu')
const role_col = require('./../models/role')
const password_col = require('./../models/password')

// 注册
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
    let sessionId = md5(`${userId}${user}`)
    ctx.session.userInfo = { userId, user, sessionId }
    return ctx.success({ msg: '登录成功', data: { userId, user, userName, sessionId } })
  }
}

const getUser = async (ctx, next) => {
  let { name, account, status } = ctx.request.body
  let search = JSON.parse(JSON.stringify({ name, account, status }))
  let result = await user_col.find(search)
  result = result.map(item => {
    let obj = JSON.parse(JSON.stringify(item))
    obj.name = item.userName
    obj.account = item.user
    return obj
  })
  ctx.success({ data: { list: result } })
}

// 获取授权菜单按钮（批量多个条件查询）
const getUserAuthMenu = async (ctx, next) => {
  let { userId } = ctx.request.body
  let userObj = await user_col.findOne({ userId })
  let roleObj = await role_col.findOne({ roleId: userObj.roleId })
  let searchIds = Array.prototype.concat.call(roleObj.menuIdList, roleObj.btnIdList)
  let result = await menu_col.find({ $or: [{ id: { $in: searchIds } }]})
  ctx.success({ data: { list: result } })
}

const getAllMenu = async (ctx, next) => {
  let { menuName, status } = ctx.request.body
  let search = JSON.parse(JSON.stringify({ menuName, status }))
  search.delete = 0
  let result = await menu_col.find(search)
  ctx.success({ data: { list: result } })
}

// 获取字段
const field = async (ctx, next) => {
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
  ctx.session.userInfo = {}
  ctx.success()
}

// 编辑用户信息
const modifyUserInfo = async (ctx, next) => {
  let { id, account, name, password, status, operator, roleId } = ctx.request.body
  if (!account) {
    ctx.throw(400, '缺少参数')
  }
  let result = await user_col.findOne({ user: account })
  let oldRoleId = result.roleId
  if (result && result.userId !== id) {
    return ctx.success({ code: '000001', msg: '账号已存在' })
  }
  let search = JSON.parse(JSON.stringify({ user: account, userName: name, status, operator, roleId }))
  if (roleId !== oldRoleId) {
    let roleObj = await role_col.findOne({ roleId: oldRoleId })
    let { userIdList } = roleObj
    let index = userIdList.indexOf(id)
    if (index !== -1) {
      userIdList.splice(index, 1)
    }
    await role_col.updateOne({ roleId: oldRoleId }, { $set: { userIdList } })
    let newRoleObj = await role_col.findOne({ roleId })
    search.roleName = newRoleObj.roleName
    let newUserIdList = newRoleObj.userIdList
    newUserIdList.push(id)
    await role_col.updateOne({ roleId }, { $set: { userIdList: newUserIdList } })
  }
  await user_col.update({ userId: id }, { $set: search }, () => {
    if (password) return false
    ctx.success()
  })
  password && await password_col.update({ userId: id }, { $set: { password } }, () => {
    ctx.success()
  })
}

// 新增用户
const addUser = async (ctx, next) => {
  const { account, name, password, operator, roleId } = ctx.request.body
  let roleName = ''
  if (!account || !name || !password) {
    ctx.throw(400, '缺少参数')
  }
  const userArr = await user_col.find()
  const userLength = userArr.length
  if (userArr.find(item => item.user === account)) {
    return ctx.success({ msg: '账号已存在', code: '000001' })
  }
  const userId = userLength + 1
  if (roleId) {
    let result = await role_col.findOne({ roleId })
    roleName = result.roleName
    let userIdList = result.userIdList
    userIdList.push(userId)
    await role_col.updateOne({ roleId }, { $set: { userIdList } })
  }
  const newUser = await user_col.create({
    userId, user: account, userName: name, operator, roleId, roleName, createTime: ctx.formatDate()
  })
  if (newUser) {
    const result = await password_col.create({ userId, password })
    if (result) {
      return ctx.success({ msg: '注册成功', code: '000000' })
    }
  }
}

// 删除账号(彻底批量删除数据)
const deleteUser = async (ctx, next) => {
  let { id } = ctx.request.body
  if (id.includes(1)) {
    return ctx.success({ msg: '超级管理员不能删除', code: '000001' })
  }
  for(let i = 0; i < id.length; i++) {
    let result = await user_col.findOne({ userId: id[i] })
    let roleObj = await role_col.findOne({ roleId: result.roleId })
    let { userIdList } = roleObj
    let index = userIdList.indexOf(id[i])
    index !== -1 && userIdList.splice(index, 1)
    await role_col.updateOne({ roleId: roleObj.roleId }, { $set: { userIdList } })
  }
  await user_col.remove({ userId: { $in: id } })
  await password_col.remove({ userId: { $in: id } }, () => {
    ctx.success()
  })
}

module.exports = {
  register, login, getUserAuthMenu, getAllMenu, field, loginOut, modifyPassword, getUser, modifyUserInfo, deleteUser, addUser
}
