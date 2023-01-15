const dbmodel = require('../model/dbmodel')

const User = dbmodel.model('User')
const Friend = dbmodel.model('Friend')
const Message = dbmodel.model('Message')
const Group = dbmodel.model('Group')
const GroupMember = dbmodel.model('GroupMember')
const GroupMessage = dbmodel.model('GroupMessage')

// 查询用户名数量
exports.countUserName = (whereStr, callback) => {
    User.countDocuments(whereStr, (err, result) => {
        callback(err, result)
    })
}

// 查询邮箱数量
exports.countUserEmail = (whereStr, callback) => {
    User.countDocuments(whereStr, (err, result) => {
        callback(err, result)
    })
}

// 新建用户
exports.buildUser = (whereStr, callback) => {
    let user = new User(whereStr)
    user.save((err, result) => {
        callback(err, result)
    })
}

// 用户登录
exports.matchUser = (whereStr, callback) => {
    User.findOne(whereStr, {pwd: 1}, (err, result) => {
        callback(err, result)
    })
}

/*
 *
 *  以下的操作请求头都需要有token
 *
 */
// 获取用户信息
exports.getUserInfo = (_id, callback) => {
    let out = { 'pwd': 0, 'privateKey': 0, 'publicKey': 0 }

    User.findOne({_id}, out, (err, result) => {
        callback(err, result)
    })
}

// 搜索用户
exports.searchUser = (key, callback) => {
    let whereStr = {$or:[{'name': {$regex:key}}, {'email': {$regex:key}}]}
    let out = { 'name': 1, 'email': 1, 'imgUrl': 1 }

    User.find(whereStr, out, (err, result) => {
        callback(err, result)
    })
}

// 查询好友关系
exports.relationShip = (whereStr, callback) => {
    Friend.findOne(whereStr, {'state': 1}, (err, result) => {
        callback(err, result)
    })
}

// 搜索群
exports.searchGroup = (key, callback) => {
    let whereStr = {'name': {$regex:key}}
    let out = { 'name': 1, 'imgUrl': 1 }

    Group.find(whereStr, out, (err, result) => {
        callback(err, result)
    })
}

// 用户是否为群成员
exports.isInGroup = (whereStr, callback) => {
    GroupMember.countDocuments(whereStr, (err, result) => {
        callback(err, result)
    })
}

// 新建用户关系
exports.buildRelation = (data) => {
    data.time = new Date()

    let friend = new Friend(data)

    friend.save((err, result) => {
        if (err) {
            console.log('建立关系错误', err)
        }
    })
}

// 好友申请
exports.friendApply = (data, res) => {
    let userId = data.userId
    let friendId = data.friendId

    // 直接查询有没有任意种关系，无需查询两遍，因为建立关系时是双向的
    let whereStr = { userId, friendId }
    Friend.countDocuments(whereStr, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            data.types = "0"

            if (result == 0) {
                this.buildRelation({userId, friendId, state: "1"})
                this.buildRelation({userId: friendId, friendId: userId, state: "2"})
            }

            this.insertMsg(data, res)
        }
    })
}

// 插入信息
exports.insertMsg = (data, res) => {
    data.time = new Date()
    data.state = '1'

    let msg = new Message(data)

    msg.save((err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc('发送成功', 0)
        }
    })
}

// 修改好友关系
exports.updateFriendRelation = (data, state, res) => {
    Friend.updateMany(data, {state}, (err, result) => {
        if (err) {
           res.cc(err)
        } else {
            res.cc('请求成功', 0)
        }
    })
}

// 同意好友申请
exports.agreeApply = (data, res) => {
    Friend.findOne(data, {state: 1}, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            if (result.state && result.state == '2') {
                // 只有被申请方才能同意
                let whereStr = {$or: [
                    data,
                    {'friendId': data.userId, 'userId': data.friendId}
                ]}
                this.updateFriendRelation(whereStr, '0', res)
            } else {
                res.cc('无权同意', 2)
            }
        }
    })
}

// 删除好友关系
exports.deleteFriendRelation = (data, callback) => {
    let whereStr = {$or: [
        data,
        {'friendId': data.userId, 'userId': data.friendId}
    ]}

    Friend.deleteMany(whereStr, (err, result) => {
        callback(err, result)
    })
}

// 删除聊天记录
exports.deleteChatRecord = (data, callback) => {
    let whereStr = {$or: [
        data,
        {'friendId': data.userId, 'userId': data.friendId}
    ]}

    Message.deleteMany(whereStr, (err, result) => {
        callback(err, result)
    })
}

// 获取好友列表
exports.getFriends = (userId, callback) => {
    Friend.find({userId, state: '0'}, {friendId: 1, nickname: 1}, async (err, result) => {
        if (err) {
            callback(err)
        } else {
            let friendsInfo = []
            let info = {}
            for (let i = 0; i < result.length; i++) {
                info = await User.findOne({_id: result[i].friendId},{name: 1, imgUrl: 1})
                info.nickname = result[i].nickname
                friendsInfo.push(info)
            }
            callback('', friendsInfo)
        }
    })
}

// 获取好友申请列表
exports.getFriendApplys = (userId, callback) => {
    Friend.find({userId, state: '2'}, {friendId: 1}, async (err, result) => {
        if (err) {
            callback(err)
        } else {
            let friendsInfo = []
            let info = {}
            let msgs = []
            let msg = []

            for (let i = 0; i < result.length; i++) {
                info = await User.findOne({_id: result[i].friendId},{name: 1, imgUrl: 1})
                friendsInfo.push(info)

                msg = await Message.find({userId: result[i].friendId, friendId: userId}, {content: 1, time: 1})
                msgs.push(msg)
            }

            let arr = friendsInfo.map((item, index) => {
                return {name: item.name, imgUrl: item.imgUrl, friendId: item._id, msgs: msgs[index]}
            })

            callback('', arr)
        }
    })
}

// 获取聊天记录
exports.getAllMsgs = (userId, callback) => {
    let whereStr1 = {$or: [
        { userId },
        { friendId: userId }
    ]}

    Message.find(whereStr1, (err, result) => {
        if (err) {
            callback(err)
        } else {
            // 将所有消息整理成一个对象，对象包含一个用户的id和所有消息的数组
            let arr = result.reduce((prev, item) => {
                // 在上一个结果数组中寻找和当前id相同的对象的地址
                let friend = prev.find((prevItem) => {
                    // 不管是接收方还是发送方都需要添加进数组
                    return String(prevItem.friendId) == String(item.userId) || String(prevItem.friendId) == String(item.friendId)
                })

                if (friend) {
                    // 如果存在则直接将当前项（一个消息）push入该用户的消息数组
                    friend.allMsgs.push(item)
                } else {
                    // 如果不存在则直接添加进去一个新的用户对象，并传给下一次循环
                    let data = {}
                    // 若是第一次添加，则需要找出好友id
                    if (userId == item.userId) {
                        data.friendId = item.friendId
                    } else {
                        data.friendId = item.userId
                    }
                    data.allMsgs = [ item ]
                    prev.push(data)
                }
                return prev
            }, [])

            if (arr.length > 0) {
                let newArr = []
                let whereStr2 = {}
                let out = { 'name': 1, 'imgUrl': 1, 'nickname': 1 }

                arr.forEach((item, index) => {
                    whereStr2 = {userId, friendId: item.friendId, state: '0'}

                    // 去除非好友状态的消息
                    Friend.countDocuments(whereStr2, async (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result > 0) {
                                // 附带好友信息
                                let info = await User.findOne({_id: item.friendId}, out)
                                item.name = info.name
                                item.imgUrl = info.imgUrl
                                item.nickname = info.nickname
                                newArr.push(item)
                            }
                            // 判断是否遍历完成
                            if(index == arr.length - 1) {
                                callback('', newArr)
                            }
                        }
                    })
                })
            } else {
                callback('', arr)
            }
        }
    })
}

// 已读单个好友发送的所有消息
exports.readFriendMsgs = (data, callback) => {
    let whereStr = {
        userId: data.friendId,
        friendId: data.userId,
        state: '1'
    }

    Message.updateMany(whereStr, {state: '0'}, (err, result) => {
        callback(err, result)
    })
}
