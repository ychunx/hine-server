// 登录页接口
const dbserver = require('../dao/dbserver')

module.exports = (router) => {
    router.post('/signin', (req, res) => {
        // 判断传过来的是用户名还是邮箱地址
        let regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        let isEmail = regEmail.test(req.body.acct)
        let data = {}
        data.psw = req.body.psw
        if (isEmail) {
            data.email = req.body.acct
            dbserver.matchUser(data, 'email', res)
        } else {
            data.name = req.body.acct
            dbserver.matchUser(data, 'name', res)
        }
    })
}