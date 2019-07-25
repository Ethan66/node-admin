const Koa = require('koa')
const cors = require('koa2-cors') // 跨域
const bodyParser = require('koa-bodyparser') // post请求获取请求参数
const response = require('./app/middlewares/response')
const formatDate = require('./app/middlewares/formatDate')
const mongoose = require('mongoose')
const mongodb = require('./config').mongodb

const router1 = require('./routes')

const app = new Koa()

 // 连接数据库
mongoose.connect(mongodb.db, { useNewUrlParser:true }, (err) => {
  if (err) {
    console.error('Failed to connect to database')
  } else {
    console.log('Connecting database successfully')
  }
})

// 中间件：中间件就是匹配路由之前或者匹配路由完成做的一系列的操作（比如：执行任何代码、修改请求和响应对象、终结请求-响应循环、调用堆栈中的下一个中间件。）
// 中间件可以做什么？比如后台管理系统，需要在每个接口之前判断当前用户是否有登录，只需要在所有路由之前使用应用级中间件即可

// 执行顺序：不管书写顺序，先执行应用级中间件，再执行路由级中间件

/* app.use('/index', async (ctx, next) => { // 第一个参数表示匹配某个路由，不写表示匹配所有路由
  ctx.body = '相应内容'
  await next() // 当前路由匹配完成后，继续向下匹配
}) */


// 应用级中间件
app.use(async (ctx, next) => { // 可以处理后台管理系统判断当前用户是否登录
  console.log(ctx) // ctx保存请求响应所有数据，上下文context
  await next()
})

// 应用级中间件end

// 错误级中间件
app.use(async (ctx, next) => {
  await next()
  if (ctx.status === 404) {
    ctx.status = 404
    ctx.body = '这是一个404页面'
  }
})


// 路由级中间件：
// 这部分就转移到routes文件夹
const Router = require('koa-router')
const router = new Router()

router.get('/index', async (ctx, next) => { // async函数部分就是controllers文件夹的部分
  console.log(ctx) // ctx保存请求响应所有数据，上下文context
  console.log(ctx.query, ctx.request.query) // 获取的是参数对象
  console.log(ctx.querystring, ctx.request.querystring) // 获取的是参数字符串
  console.log(ctx.url, ctx.request.url) // 获取url地址
  ctx.body = '这是首页' // 设置响应内容，不然就会报404
  await next()
})
router.post('/news', async (ctx, next) => { // async函数部分就是controllers文件夹的部分
  ctx.body = '新闻页面'
  await next()
})
app.use(router.routes()) // 启动路由。理解：根据路由保存到一个对象中，当http.createServer()函数里，根据请求的路由执行对象里的方法，这样就触发了async的回调函数
app.use(router.allowedMethods()) // 官网文档推荐,如果自己没有设置响应头，默认给你响应头

// 因为router和app.use返回的是本身，所以可以链式调用
router.get('/index', async (ctx, next) => {
  ctx.body = '这是首页'
  await next()
}).post('/news', async (ctx, next) => {
  ctx.body = '新闻页面'
  await next()
})
app.use(router.routes()).use(router.allowedMethods())

// 动态路由：从路由上获取参数，比如爱词霸，只要输入相应单词，就会翻译此单词
router.get('/newscontent/:a/:b', async ctx => {
  console.log(ctx.params) // 在浏览器上输入localhost:3000/newscontent/123/456，打印的是{a: 123, b: 456}
})

// 路由中间件end


// 设置cookie
router.get('/setCookie', async (ctx, next) => {
  ctx.cookies.set('userInfo', 'Ethan', {
    maxAge: 60*1000,
    path: '/getCookie', // 配置可访问的路由，默认是所有路由都可以拿到：当客户端只有在路由为/getCookie里可以通过document.cookie获取
    httpOnly: false // true为只有服务端可以访问，false表示服务器和客户端都可以访问：为true时客户端执行document.cookie，拿不到任何值
  })
  let fullName = new Buffer('庄成').toString('base64') // cookie不能设置中文，要转为base64
  ctx.cookies.set('fullName', fullName, {
    maxAge: 60*1000
  })
  ctx.body = '设置cookie'
  await next()
})
// 获取cookie
router.get('/getCookie', async (ctx, next) => {
  let userInfo = ctx.cookies.get('userInfo')
  let fullName = ctx.cookies.get('fullName')
  // let fullName1 = new Buffer(fullName, 'base64').toString()
  // ctx.body = `userInfo: ${userInfo}；fullName: ${fullName1}`
  ctx.body = fullName
})

// session：不同于cookie，是保存在服务器中的
// 当浏览器访问服务器并发送第一次请求时，服务器端会创建一个 session 对象，生成一个类似于 key,value 的键值对
// 然后将 key(cookie)返回到浏览器(客户)端，浏览器下次再访问时，携带 key(cookie)，找到对应的 session(value)。 客户的信息都保存在 session 中

// 设置session
/* 
npm install koa-session // 安装koa-session
const session = require('koa-session'); // 引入koa-session
 
app.keys = ['some secret hurr']; // cookie的签名
 
const CONFIG = {
  maxAge: 30000, // 设置过期时间，当过了30秒后session过期了,获取的就是undefined
  autoCommit: true,
  overwrite: true,
  httpOnly: true, // 只有服务器端可以获取cookie
  signed: true, // 默认签名
  rolling: false, // 每次访问重新设置过期时间，比如过期时间是30秒，过了20秒后又获取，所以又重新设置了session
  renew: true, // 过期时间30秒，快要过期了重新设置了session
};
router.get('/setSession', (ctx, next) => { // 先访问这个路由
  ctx.session.userInfo = '张三'
  ctx.body = '设置session成功'
  await next()
})
router.get('/getSession', (ctx, next) => { // 然后访问这个路由，在30秒内请求，都不会过期
  ctx.body = ctx.session.userInfo
  await next()
})
 */



// post请求要用koa-bodyparser中间件：因为post请求获取参数是异步操作，所以要用封装的
// 原生node写法
router.post('./add', async ctx => {
  let fn = function (ctx) {
    return new Promise((resolve, reject) => {
      try{
        let str = ''
        ctx.req.on('data', (chunk) => {
          str += chunk
        })
        ctx.req.on('end', (chunk) => {
          resolve(str)
        })
      }catch (err) {
        reject(err)
      }
    })
  }
  let data = await fn()
  ctx.body = data
})


app.use(cors())
app.use(bodyParser())
app.use(response)
app.use(formatDate)

const example_router = require('./routes/example_router')
app.use(example_router.routes()).use(example_router.allowedMethods())

app.use(router1.routes()).use(router1.allowedMethods())

app.listen(mongodb.port)