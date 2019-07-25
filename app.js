const Koa = require('koa')
const cors = require('koa2-cors') // 跨域
const bodyParser = require('koa-bodyparser') // post请求获取请求参数
const session = require('koa-session')
const response = require('./app/middlewares/response')
const formatDate = require('./app/middlewares/formatDate')
const mongoose = require('mongoose')
const mongodb = require('./config').mongodb
const session_config = require('./config/session')
const verify_sessionId = require('./app/middlewares/verifySessionId')

const router = require('./routes')

const app = new Koa()

mongoose.connect(mongodb.db, { useNewUrlParser:true }, (err) => { // 连接数据库
  if (err) {
    console.error('Failed to connect to database')
  } else {
    console.log('Connecting database successfully')
  }
})

app.keys = session_config.keys
app.use(session(session_config.CONFIG, app))

app.use(cors())
app.use(bodyParser())
app.use(response)
app.use(formatDate)
app.use(verify_sessionId)


const example_router = require('./routes/example_router')
app.use(example_router.routes()).use(example_router.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

app.listen(mongodb.port)