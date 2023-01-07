// 搜索页接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 搜索用户
    router.post('/search/user', (req, res) => {
        dbserver.searchUser(req.body.key, res)
    })

    // 查询好友关系
    router.post('/search/relation', (req, res) => {
        dbserver.relationShip(req.body, res)
    })

    // 搜索群
    router.post('/search/group', (req, res) => {
        dbserver.searchGroup(req.body.key, res)
    })

    // 查询用户是否为群内成员
    router.post('/search/isingroup', (req, res) => {
        dbserver.isInGroup(req.body, res)
    })
}