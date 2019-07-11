const config = require('../config'),
      Router = require('koa-router'),
      router = new Router({
        prefix: config.app.routerBaseApi
      }),
      user = require('../app/controllers/user')

router.post('/register', user.register)
      .post('/login', user.login)

module.exports = router