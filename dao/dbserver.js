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
    let jwtRes = ''
    try {
        jwtRes = jwt.verify(token, config.jwtSecretKey)
    } catch (error) {
        res.cc('token已失效', 2)
    }
    let _id = jwtRes._id
    let out = { 'name': 1, 'imgUrl': 1 }
    User.findOne({_id}, out, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
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
    data.state = '0'
    Friend.countDocuments(data, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            if (result == 0) {
                res.cc('双方非好友', 2)
            } else {
                res.cc('双方是好友', 0)
            }
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
    Friend.countDocuments(data, (err, result) => {
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
exports.buildRelation = (data, res) => {
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
            if (result == 0) {
                this.buildRelation({userId, friendId, state: "1"})
                this.buildRelation({userId: friendId, friendId: userId, state: "2"})
            }
            data.types = "0"
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