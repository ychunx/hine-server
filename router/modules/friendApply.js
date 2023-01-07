// 好友申请接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 申请添加
    router.post('/friendapply', (req, res) => {
        dbserver.friendApply(req.body, res)
    })
}