const role_col = require('./../models/role')
const user_col = require('./../models/user')
const menu_col = require('./../models/menu')

const getRole = async (ctx, next) => {
  const { roleName, status } = ctx.request.body
  const searchObj = JSON.parse(JSON.stringify(({ roleName, status, delete: 0 })))
  let result = await role_col.find(searchObj)
  if (result) {
    return ctx.success({ data: { list: result } })
  }
}

// 获取角色授权（批量搜索数据）
const getRoleAuthority = async (ctx, next) => {
  const { roleId } = ctx.request.body
  if (!roleId) {
    ctx.throw(400, '缺少参数')
  }
  let menuList = await menu_col.find({ menuLevel: { $in: [2,3] } })
  let secondMenuList = menuList.filter(item => item.menuLevel === 2).map(item => ({ menuName: item.menuName, menuId: item.id }))
  let thirdMenuList = menuList.filter(item => item.menuLevel === 3).map(item => ({ menuName: item.menuName, menuId: item.id, menuParentId: item.menuParentId }))
  let roleResult = await role_col.findOne({ roleId })
  let authBtnListResult = []
  thirdMenuList.forEach(item => {
    if (roleResult.btnIdList.includes(item.menuId)) {
      authBtnListResult.push({ menuId: item.menuId, menuParentId: item.menuParentId })
    }
  })
  ctx.success({ data: { menuList: secondMenuList, btnList: thirdMenuList, authObjectList: roleResult.menuIdList, authBtnList: authBtnListResult } })
}

const addRole = async (ctx, next) => {
  const { userName, roleName, status = 0, userIdList = [] } = ctx.request.body
  let resultList = await role_col.find({})
  const roleId = resultList.length + 1
  let result = await role_col.create({ operator: userName, roleId, roleName, userIdList, status, updateDate: ctx.formatDate() })
  if (result) {
    return ctx.success()
  }
}

const modifyRole = async (ctx, next) => {
  const { userName, roleId, roleName, status, userIdList } = ctx.request.body
  if (!roleId || !userName) {
    ctx.throw(400, '缺少参数')
  }
  let data = JSON.parse(JSON.stringify({ operator: userName, roleName, userIdList, status, updateDate: ctx.formatDate() }))
  let roleObj = await role_col.findOne({ roleId })
  let removeIdList = roleObj.userIdList.filter(id => !userIdList.includes(id)) // 找出原来已经在本角色下的的userId，需要删除
  await role_col.update({ roleId }, { $set: data }) // 关联最新用户userId
  await user_col.updateMany({ userId: { $in: removeIdList } }, { $set: { roleId: undefined, roleName: '', userName, updateDate: ctx.formatDate() } }) // user表删除已取消管理角色的用户
  await user_col.updateMany({ userId: { $in: userIdList } }, { $set: { roleId, roleName, operator: userName, updateDate: ctx.formatDate() } }, () => {
    ctx.success()
  })
}

const modifyRoleAuthority = async (ctx, next) => {
  const { roleId, btnIdList, menuIdList, userName } = ctx.request.body
  if (!roleId || !btnIdList || !menuIdList) {
    ctx.throw(400, '缺少参数')
  }
  let secondMenuList = await menu_col.find({ id: { $in: menuIdList } })
  let firstMenuList = []
  secondMenuList.forEach(menu => {
    if (!firstMenuList.includes(menu.menuParentId)) {
      firstMenuList.push(menu.menuParentId)
    }
  })
  menuIdList.push(...firstMenuList)
  await role_col.update({ roleId }, { $set: { btnIdList, menuIdList, operator: userName, updateDate: ctx.formatDate() } }, () => {
    ctx.success()
  })
}

// 删除角色（逻辑批量删除数据）
const deleteRole = async (ctx, next) => {
  const { userName, id: roleIdArr } = ctx.request.body
  if (!roleIdArr || !userName) {
    ctx.throw(400, '缺少参数')
  }
  let data = JSON.parse(JSON.stringify({ operator: userName, updateDate: ctx.formatDate(), delete: 1 }))
  await role_col.updateMany({ roleId: { $in: roleIdArr } }, { $set: data }, () => {
    ctx.success()
  })
}

module.exports = {
  addRole, getRole, getRoleAuthority, modifyRole, modifyRoleAuthority, deleteRole
}
