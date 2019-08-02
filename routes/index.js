const config = require('../config'),
      Router = require('koa-router'),
      router = new Router({
        prefix: config.app.routerBaseApi
      }),
      user = require('../app/controllers/user'),
      menu = require('../app/controllers/menu'),
      role = require('../app/controllers/role')

router.post('/register', user.register)
      .post('/login', user.login)
      .post('/getAllMenu', user.getAllMenu)
      .post('/getUserAuthMenu', user.getUserAuthMenu)
      .post('/getUserFields', user.field)
      .post('/loginOut', user.loginOut)
      .post('/modifyPassword', user.modifyPassword)
      .post('/getUser', user.getUser)
      .post('/addUser', user.addUser)
      .post('/modifyUserInfo', user.modifyUserInfo)
      .post('/deleteUser', user.deleteUser)
      .post('/addMenu', menu.addMenu)
      .post('/modifyMenu', menu.modifyMenu)
      .post('/deleteMenu', menu.deleteMenu)
      .post('/addRole', role.addRole)
      .post('/getRole', role.getRole)
      .post('/getRoleAuthority', role.getRoleAuthority)
      .post('/modifyRole', role.modifyRole)
      .post('/modifyRoleAuthority', role.modifyRoleAuthority)
      .post('/deleteRole', role.deleteRole)

module.exports = router