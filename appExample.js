const Koa = require('koa')
const cors = require('koa2-cors') // 跨域
const bodyParser = require('koa-bodyparser') // post请求获取请求参数
const response = require('./app/middlewares/response')
const formatDate = require('./app/middlewares/formatDate')
const mongodb = require('./config').mongodb

const router1 = require('./routes')

const app = new Koa()

// 因为router和app.use返回的是本身，所以可以链式调用
router.get('/index', async (ctx, next) => {
  ctx.body = '这是首页'
  await next()
}).post('/news', async (ctx, next) => {
  ctx.body = '新闻页面'
  await next()
})
app.use(router.routes()).use(router.allowedMethods())


app.use(cors())
app.use(bodyParser())
app.use(response)
app.use(formatDate)

const example_router = require('./routes/example_router')
app.use(example_router.routes()).use(example_router.allowedMethods())

app.use(router1.routes()).use(router1.allowedMethods())

app.listen(mongodb.port)