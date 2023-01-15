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
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('拒绝成功', 200)
            }
        }
        dbserver.deleteFriendRelation(req.body, callback)
    })

    // 删除好友
    router.post('/friend/delete', (req, res) => {
        let {userId, friendId} = req.body
        let callback1 = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                let callback2 = (err, result) => {
                    if (err) {
                        res.cc(err)
                    } else {
                        res.cc('删除成功', 200)
                    }
                }
                dbserver.deleteFriendRelation({userId, friendId}, callback2)
            }
        }
        // 删除聊天记录
        dbserver.deleteChatRecord({userId, friendId}, callback1)
    })

    // 获取好友列表
    router.get('/friend/getfriends', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.getFriends(req.jwt_id, callback)
    })

    // 获取好友申请列表
    router.get('/friend/getfriendapplys', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.getFriendApplys(req.jwt_id, callback)
    })
}