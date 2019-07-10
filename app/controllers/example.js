// 引入刚才定义的表
const Example_col = require('./../models/example')

// get 请求返回所有数据
const getExample = async (ctx, next) => {
  const url = ctx.url // 获取请求路由
  const request = ctx.request // 请求报文：请求行，请求头，请求体
  const req_ctx = ctx.query // 参数对象形式
  const req_ctx1 = ctx.querystring // 参数字符串形式name=frank&serviceId=210

  const examples = await Example_col.find({})

  ctx.status = 200 // 响应状态码
  ctx.body = { // 响应体
    msg: 'get request!!',
    data: {
      url, request, req_ctx, req_ctx1, examples
    }
  }
}

// post 带一个 msg 参数，并插入数据库
/* const postExample = async (ctx, next) => {
  const request = ctx.request // 请求报文：请求行，请求头，请求体
  const req = request.body // 请求体：包含参数，只有引入了中间件：koa-bodyparser才能使用

  ctx.status = 200 // 响应状态码
  if (!req.msg || typeof req.msg != 'string') {
    ctx.status = 401
    ctx.body = { // 响应体
      code: '000001',
      msg: 'type is error',
      data: {
        req, request
      }
    }
    return
  }

  const result = await Example_col.create({msg: req.msg})

  ctx.body = {
    code: '000000',
    msg: 'success',
    data: {
      result, req, request
    }
  }
} */
// 综上所述，发现响应体会根据判断条件增多而产生累赘代码，所以需要封装函数，所以封装一个response.js中间件
// 改进
const postExample = async (ctx, next) => {
  const req = ctx.request.body

  // ctx.status = 200 // 响应状态码
  if (!req.msg) {
    ctx.throw(400, 'msg不能为空') // 抛错：内置方法
  }
  if (typeof req.msg !== 'string') {
    ctx.throw(400, 'msg类型错误') // 抛错：内置方法
  }
  const findResult = await Example_col.findOne({ msg: req.msg }).exec().catch(err => { ctx.throw(500, '服务器内部错误') })
  console.log(222, findResult)
  if (findResult) {
    return ctx.success({ code: '000001', msg: 'msg重复' })
  }
  const result = await Example_col.create({ msg: req.msg }).catch(err => ctx.throw(500, '服务器内部错误'))
  ctx.success({ msg: '添加成功', data: { result } })
}

// 暴露出这两个方法，在路由中使用
module.exports = {
  getExample,
  postExample
}
