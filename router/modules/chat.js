// 聊天相关接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 获取聊天记录
    router.get('/chat/getallmsgs', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.getAllMsgs(req.jwt_id, callback)
    })

    // 已读单个好友的所有消息
    router.post('/chat/readfriendmsgs', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('请求成功', 200)
            }
        }
        dbserver.readFriendMsgs(req.body, callback)
    })
}