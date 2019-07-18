const menu_col = require('./../models/menu')

const addMenu = async (ctx, next) => {
  let req = ctx.request.body
  let { menuLevel, menuParentId } = req
  if (!menuLevel) {
    ctx.throw(400, '缺少参数')
  }
  !menuParentId && (menuParentId = 0)
  let menuArr = []
  menuArr = await menu_col.find({ menuParentId })
  let maxId = Number(menuParentId + '01')
  menuArr.length && (maxId = Math.max(...menuArr.map(item => item.id)) + 1)
  req.id = maxId
  const newUrl = await menu_col.create(Object.assign({}, req, { menuParentId }))
  if (newUrl) {
    ctx.success({ msg: '添加成功' })
  }
}

const modifyMenu = async (ctx, next) => {
  let req = ctx.request.body
  const { id } = req
  if (!id) {
    ctx.throw(400, '缺少参数')
  }
  const result = await menu_col.update({ id }, {
    $set: {
      ...req
    }
  })
  if (result) {
    ctx.success({ msg: '修改成功' })
  }
}

const deleteMenu = async (ctx, next) => {
  const { id } = ctx.request.body
  if (!id) {
    ctx.throw(400, '缺少参数')
  }
  const result = await menu_col.deleteOne({ id })
  if (result) {
    ctx.success({ msg: '删除成功' })
  }
}

module.exports = {
  addMenu, modifyMenu, deleteMenu
}