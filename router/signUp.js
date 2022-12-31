// 注册页接口
const dbserver = require('../dao/dbserver')

module.exports = (router) => {
    // 注册
    router.post('/signup/adduser', (req, res) => {
        dbserver.buildUser(req.body, res)
    })

    // 查询用户名是否已被占用
    router.post('/signup/nameinuse', (req, res) => {
        dbserver.countUserName(req.body, res)
    })

    // 查询邮箱是否已被占用
    router.post('/signup/emailinuse', (req, res) => {
        dbserver.countUserEmail(req.body, res)
    })
}