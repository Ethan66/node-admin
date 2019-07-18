const config = require('../config'),
      Router = require('koa-router'),
      router = new Router({
        prefix: config.app.routerBaseApi
      }),
      user = require('../app/controllers/user'),
      menu = require('../app/controllers/menu')

router.post('/register', user.register)
      .post('/login', user.login)
      .post('/getUserResource', user.menu)
      .post('/getUserFields', user.field)
      .post('/loginOut', user.loginOut)
      .post('/modifyPassword', user.modifyPassword)
      .post('/addMenu', menu.addMenu)
      .post('/modifyMenu', menu.modifyMenu)
      .post('/deleteMenu', menu.deleteMenu)

module.exports = router