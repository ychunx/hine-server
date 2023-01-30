// 聊天相关接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 获取所有非加密聊天记录
    router.get('/chat/getallmsgs', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.getAllMsgs(req.jwt_id, false, callback)
    })

    // 获取所有加密聊天记录
    router.get('/chat/getallencryptedmsgs', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.getAllMsgs(req.jwt_id, true, callback)
    })

    // 已读单个好友的所有非加密消息
    router.post('/chat/readfriendmsgs', (req, res) => {
        let userId = req.jwt_id
        let friendId = req.body.friendId
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('请求成功', 200)
            }
        }
        dbserver.readFriendMsgs({userId, friendId}, false, callback)
    })

    // 已读单个好友的所有加密消息
    router.post('/chat/readfriendencryptedmsgs', (req, res) => {
        let userId = req.jwt_id
        let friendId = req.body.friendId
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('请求成功', 200)
            }
        }
        dbserver.readFriendMsgs({userId, friendId}, true, callback)
    })

    // 删除非加密聊天记录
    router.post('/chat/delete', (req, res) => {
        let userId = req.jwt_id
        let friendId = req.body.friendId
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('删除成功', 200)
            }
        }

        dbserver.deleteChatRecord({userId, friendId}, false, callback)
    })

    // 删除加密聊天记录
    router.post('/chat/deleteencrypted', (req, res) => {
        let userId = req.jwt_id
        let friendId = req.body.friendId
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('删除成功', 200)
            }
        }

        dbserver.deleteChatRecord({userId, friendId}, true, callback)
    })
}