const keys = ['some secret hurr'] // cookie的签名
 
const CONFIG = {
  maxAge: 1000 * 60 * 60, // 设置过期时间，当过了30秒后session过期了,获取的就是undefined
  autoCommit: true, // 自动提交到响应头,后面所有接口request headers里都有Cookie属性
  overwrite: true, // 是否允许重写
  httpOnly: true, // 只有服务器端可以获取cookie
  signed: true, // 默认签名
  rolling: false, // 每次访问重新设置过期时间，比如过期时间是30秒，过了20秒后又获取，所以又重新设置了session
  renew: true, // 过期时间30秒，快要过期了重新设置了session
}

module.exports = { keys, CONFIG }