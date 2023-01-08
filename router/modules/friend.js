// 好友申请接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 申请添加
    router.post('/friend/apply', (req, res) => {
        if (req.body.content == '') {
            req.body.content = '请求添加好友'
        }
        dbserver.friendApply(req.body, res)
    })

    // 同意添加
    router.post('/friend/agree', (req, res) => {
        dbserver.agreeApply(req.body, res)
    })

    // 拒绝添加
    router.post('/friend/reject', (req, res) => {
        dbserver.deleteFriendRelation(req.body, res)
    })

    // 删除好友
    router.post('/friend/delete', (req, res) => {
        let {userId, friendId} = req.body
        if (req.body.delete) {
            dbserver.deleteChatRecord({userId, friendId})
        }
        dbserver.deleteFriendRelation({userId, friendId}, res)
    })

    // 获取好友列表
    router.get('/friend/getfriends', (req, res) => {
        dbserver.getFriends(req.get('token'), res)
    })

    // 获取好友申请列表
    router.get('/friend/getfriendapplys', (req, res) => {
        dbserver.getFriendApplys(req.get('token'), res)
    })
}