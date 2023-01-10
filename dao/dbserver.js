const dbmodel = require('../model/dbmodel')

const User = dbmodel.model('User')
const Friend = dbmodel.model('Friend')
const Message = dbmodel.model('Message')
const Group = dbmodel.model('Group')
const GroupMember = dbmodel.model('GroupMember')
const GroupMsg = dbmodel.model('GroupMsg')

// 新建用户
const emailserver = require('../dao/emailserver')
exports.buildUser = (data, res) => {
    data.registerTime = new Date()
    let user = new User(data)
    user.save((err, result) => {
        if (err) {
            res.cc(err)
        } else {
            //emailserver.emailSignUp(data.name, data.email)
            res.cc('注册成功', 0)
        }
    })
}

// 查询用户名数量
exports.countUserName = (data, res) => {
    User.countDocuments(data, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
}

// 查询邮箱数量
exports.countUserEmail = (data, res) => {
    User.countDocuments(data, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
}

// 用户登录（因需要匹配密码，故将逻辑放此处）
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/tokenConfig')
exports.matchUser = (data, type, res) => {
    let whereStr = {}
    whereStr[type] = data[type]
    let out = { 'name': 1, 'email': 1, 'psw': 1, 'imgUrl': 1 }
    User.find(whereStr, out, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            if (result == '') {
                res.cc('账号或密码错误', 2)
            } else {
                let matchPsw = bcrypt.compareSync(data.psw, result[0].psw)
                if (!matchPsw) {
                    res.cc('账号或密码错误', 2)
                } else {
                    // token 存储用户id和登录时间
                    let user = { _id: result[0]._id, loginTime: new Date() }
                    let tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
                    let backInfo = {
                        name: result[0].name,
                        imgUrl: result[0].imgUrl,
                        token: tokenStr,
                    }
                    res.cc(backInfo, 0)
                }
            }
        }
    })
}

/*
 *
 *  以下的操作请求头都需要有token
 *
 */

exports.getUserInfo = (token, res) => {
    try {
        let jwtRes = jwt.verify(token, config.jwtSecretKey)
        let _id = jwtRes._id
        let out = { 'name': 1, 'imgUrl': 1 }
        User.findOne({_id}, out, (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 0)
            }
        })
    } catch (error) {
        res.cc('token已失效', 2)
    }
}

// 搜索用户
exports.searchUser = (key, res) => {
    let whereStr = {$or:[{'name': {$regex:key}}, {'email': {$regex:key}}]}
    let out = { 'name': 1, 'email': 1, 'imgUrl': 1 }
    User.find(whereStr, out, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
}

// 查询好友关系
exports.relationShip = (data, res) => {
    Friend.findOne(data, {'state': 1}, (err, result) => {
        if (err) {
            res.cc(err)
        } else if(result) {
            if (result.state == '0') {
                res.cc('双方是好友', 0)
            } else if (result.state == '1') {
                res.cc('申请中', 2)
            } else {
                res.cc('双方非好友', 3)
            }
        } else {
            res.cc('双方非好友', 3)
        }
    })
}

// 搜索群
exports.searchGroup = (key, res) => {
    let whereStr = {'name': {$regex:key}}
    let out = { 'name': 1, 'imgUrl': 1 }
    Group.find(whereStr, out, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
}

// 用户是否为群成员
exports.isInGroup = (data, res) => {
    GroupMember.countDocuments(data, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            if (result == 0) {
                res.cc('非群内成员', 2)
            } else {
                res.cc('用户在群内', 0)
            }
        }
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
            if (result.state == '2') {
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
exports.deleteFriendRelation = (data, res) => {
    let whereStr = {$or: [
        data,
        {'friendId': data.userId, 'userId': data.friendId}
    ]}
    Friend.deleteMany(whereStr, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc('请求成功', 0)
        }
    })
}

// 删除聊天记录(单向)
exports.deleteChatRecord = (data, res) => {
    Message.deleteMany(data, (err, result) => {
        if (err) {
            console.log('删除聊天记录失败', err)
        }
    })
}

// 获取好友列表
exports.getFriends = (token, res) => {
    try {
        let jwtRes = jwt.verify(token, config.jwtSecretKey)
        let userId = jwtRes._id

        Friend.find({userId, state: '0'}, {friendId: 1, nickname: 1}, async (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                let friendsInfo = []
                let info = {}
                for (let i = 0; i < result.length; i++) {
                    info = await User.findOne({_id: result[i].friendId},{name: 1, imgUrl: 1})
                    friendsInfo.push(info)
                }
                res.cc(friendsInfo, 0)
            }
        })
    } catch (error) {
        res.cc('token已失效', 2)
    }
}

// 获取好友申请列表
exports.getFriendApplys = (token, res) => {
    try {
        let jwtRes = jwt.verify(token, config.jwtSecretKey)
        let jwtUserId = jwtRes._id

        Friend.find({userId: jwtUserId, state: '2'}, {friendId: 1}, async (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                let friendsInfo = []
                let info = {}
                let msgs = []
                let msg = []

                for (let i = 0; i < result.length; i++) {
                    info = await User.findOne({_id: result[i].friendId},{name: 1, imgUrl: 1})
                    friendsInfo.push(info)

                    msg = await Message.find({userId: result[i].friendId, friendId: jwtUserId}, {content: 1, time: 1})
                    msgs.push(msg)
                }

                let arr = friendsInfo.map((item, index) => {
                    return {name: item.name, imgUrl: item.imgUrl, friendId: item._id, msgs: msgs[index]}
                })

                res.cc(arr, 0)
            }
        })
    } catch (error) {
        res.cc('token已失效', 2)
    }
}

// 获取所有好友发送的消息
exports.getAllFriendMsgs = (token, res) => {
    try {
        let jwtRes = jwt.verify(token, config.jwtSecretKey)
        let id = jwtRes._id
        let out = {userId: 1, content: 1, time: 1, types: 1, state: 1}
        Message.find({friendId: id}, out, (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                // 将所有消息整理成一个对象，对象包含一个用户的id和包含他发送的所有消息的数组
                let arr = result.reduce((prev, item) => {
                    // 在上一个结果数组中寻找和当前id相同的对象
                    let user = prev.find((prevItem) => {
                        // 直接相比两个相同id得不到true的结果
                        return String(prevItem.userId) == String(item.userId)
                    })
                    if (user) {
                        // 如果存在则直接将当前项（一个消息）push入该用户的消息数组
                        user.friendMsgs.push(item)
                    } else {
                        // 如果不存在则直接添加进去一个新的用户对象，并传给下一次循环
                        prev.push({
                            userId: item.userId,
                            friendMsgs: [item]
                        })
                    }
                    return prev
                }, [])

                // 去除非好友状态的消息(不包括单向好友)
                let newArr = []
                arr.forEach((item, index) => {
                    Friend.countDocuments({userId: id, friendId: item.userId, state: '0'}, (err, result) => {
                        if (err) {
                            console.log('查询错误')
                        } else {
                            if (result != 0) {
                                newArr.push(item)
                            }
                            if(index == arr.length - 1) {
                                res.cc(newArr, 0)
                            }
                        }
                    })
                })
            }
        })
    } catch (error) {
        res.cc('token已失效', 2)
    }
}

// 获取所有已发送的消息
exports.getAllMyMsgs = (token, res) => {
    try {
        let jwtRes = jwt.verify(token, config.jwtSecretKey)
        let userId = jwtRes._id
        let out = {friendId: 1, content: 1, time: 1, types: 1, state: 1}
        Message.find({userId}, out, (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                // 将所有消息整理成一个对象，对象包含一个用户的id和包含他发送的所有消息的数组
                let arr = result.reduce((prev, item) => {
                    // 在上一个结果数组中寻找和当前id相同的对象
                    let user = prev.find((prevItem) => {
                        // 直接相比两个相同id得不到true的结果
                        return String(prevItem.friendId) == String(item.friendId)
                    })
                    if (user) {
                        // 如果存在则直接将当前项（一个消息）push入该用户的消息数组
                        user.myMsgs.push(item)
                    } else {
                        // 如果不存在则直接添加进去一个新的用户对象，并传给下一次循环
                        prev.push({
                            friendId: item.friendId,
                            myMsgs: [item]
                        })
                    }
                    return prev
                }, [])
                res.cc(arr, 0)
            }
        })
    } catch (error) {
        res.cc('token已失效', 2)
    }
}

// 已读单个好友的所有消息
exports.readFriendMsgs = (data, res) => {
    let whereStr = {
        userId: data.friendId,
        friendId: data.userId,
        state: '1'
    }
    Message.updateMany(whereStr, {state: '0'}, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc('请求成功',0)
        }
    })
}
