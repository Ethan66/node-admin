// 引入刚才定义的表
const Example_col = require('./../models/example')

// get 请求返回所有数据
const getExample = async (ctx, next) => {

  const examples = await Example_col.find({}, { _id: 0 })

  ctx.status = 200
  ctx.body = {
    msg: 'get request!!',
    data: {
      examples
    }
  }
}

// post 带一个 msg 参数，并插入数据库
const postExample = async (ctx, next) => {
  const req = ctx.request.body;

  ctx.status = 200
  if (!req.msg || typeof req.msg != 'string') {
    ctx.status = 401
    ctx.body = {
      msg: 'post request!!',
      desc: `parameter error！！msg: ${req.msg}`,
      data: req
    }
    return;
  }

  const result = await Example_col.create({msg: req.msg})

  ctx.body = {
    msg: 'post request!!',
    desc: 'insert success!',
    data: result
  }
}

// 暴露出这两个方法，在路由中使用
module.exports = {
  getExample,
  postExample
}
