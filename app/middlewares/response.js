//在ctx对象上挂载success方法
module.exports = async (ctx, next) => {
  // 请求成功时
  ctx.success = ({ data, msg }) => {
    ctx.body = { code: 000000, data, msg }
  }
  //这里本来封装了  ctx.error(用ctx.body封装) 却发现在catch(err)下ctx.error无法结束中间件的执行，加return也没用,因为只能return一层
  //想了下，如果用ctx.throw来封装ctx.error应该是可以的，不如ctx.throw那么好用，就没必要多去封装了。
  //传递给下一个中间件
  await next()
}

//这种写法不利于错误时停止中间件的执行
//请求失败时 status表示使用的是自定义状态码
// ctx.error = ({ data, msg, status, error }) => {
//     ctx.body = { code: 400 || status, data, msg, error };
// };
