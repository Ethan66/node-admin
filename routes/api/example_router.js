// 引入路由模块并实例化
const Router = require('koa-router')
const router = new Router()
// 导如对应的控制器
const example_controller = require('./../../app/controllers/example_controller')

// 为控制器的方法定义请求路径和请求方式
router.get('/api/example/get', example_controller.getExample)
router.post('/api/example/post', example_controller.postExample)

module.exports = router
