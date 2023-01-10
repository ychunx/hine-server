// 聊天相关接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 获取所有好友发送的消息
    router.get('/chat/getallfriendmsgs', (req, res) => {
        dbserver.getAllFriendMsgs(req.get('token'), res)
    })

    // 获取所有我已发送的消息
    router.get('/chat/getallmymsgs', (req, res) => {
        dbserver.getAllMyMsgs(req.get('token'), res)
    })

    // 已读单个好友的所有消息
    router.post('/chat/readfriendmsgs', (req, res) => {
        dbserver.readFriendMsgs(req.body, res)
    })

    // 发送消息
    router.post('/chat/sendmsg', (req, res) => {
        dbserver.insertMsg(req.body, res)
    })
}