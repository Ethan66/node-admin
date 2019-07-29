const role_col = require('./../models/role')

const getRole = async (ctx, next) => {
  const { roleName, status } = ctx.request.body
  const searchObj = JSON.parse(JSON.stringify(({ roleName, status, delete: 0 })))
  let result = await role_col.find(searchObj)
  if (result) {
    return ctx.success({ data: { list: result } })
  }
}

const addRole = async (ctx, next) => {
  const { userName, roleName, status = 0 } = ctx.request.body
  let resultList = await role_col.find({})
  const roleId = resultList.length + 1
  let result = await role_col.create({ operator: userName, roleId, roleName, status, updateDate: ctx.formatDate() })
  if (result) {
    return ctx.success()
  }
}

const modifyRole = async (ctx, next) => {
  const { userName, roleId, roleName, status } = ctx.request.body
  if (!roleId || !userName) {
    ctx.throw(400, '缺少参数')
  }
  let data = JSON.parse(JSON.stringify({ operator: userName, roleName, status, updateDate: ctx.formatDate() }))
  await role_col.update({ roleId }, { $set: data }, () => {
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
  addRole, getRole, modifyRole, deleteRole
}
