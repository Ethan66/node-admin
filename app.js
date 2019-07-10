const Koa = require('koa')
const cors = require('koa2-cors') // 跨域
const bodyParser = require('koa-bodyparser') // post请求获取请求参数
const response = require('./app/middlewares/response')
const mongoose = require('mongoose')
const mongodb = require('./config').mongodb

const router = require('./routes')

const app = new Koa()

mongoose.connect(mongodb.db, { useNewUrlParser:true }, (err) => {
  if (err) {
    console.error('Failed to connect to database')
  } else {
    console.log('Connecting database successfully')
  }
})

app.use(cors())
app.use(bodyParser())
app.use(response)

const example_router = require('./routes/example_router')
app.use(example_router.routes()).use(example_router.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

app.listen(mongodb.port)