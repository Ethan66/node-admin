const Koa = require('koa')
const cors = require('koa2-cors') // 跨域
const bodyParser = require('koa-bodyparser') // post请求获取请求参数
const mongoose = require('mongoose')
const config = require('./config')

const app = new Koa()

mongoose.connect(config.db, { useNewUrlParser:true }, (err) => {
  if (err) {
    console.error('Failed to connect to database')
  } else {
    console.log('Connecting database successfully')
  }
})

app.use(cors())
app.use(bodyParser())

const example_router = require('./routes/api/example_router')
app.use(example_router.routes()).use(example_router.allowedMethods())

app.listen(config.port)