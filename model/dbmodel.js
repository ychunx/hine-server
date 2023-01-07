const mongoose = require('mongoose')
const db = require('../config/db')

const Schema = mongoose.Schema

// 用户表
const UserSchema = new Schema({
    email: {type: String, unique: true},                    // 邮箱
    psw: {type: String},                                    // 加密后的密码
    privateKey: {type: String},                             // 加密后的私钥
    publicKey: {type: String},                              // 加密后的公钥
    name: {type: String, unique: true},                     // 用户名
    sex: {type: String, default: 'asexual'},                // 性别
    birth: {type: Date, default: new Date()},               // 生日
    signature: {type: String, default: 'ta很懒，什么都没有留下~'},  // 个性签名
    imgUrl: {type: String, default: 'http://localhost:3000/user.jpg'},            // 头像链接
    registerTime: {type: Date},                             // 注册时间
})

// 好友表
const FriendSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},     // 用户id
    friendId: {type: Schema.Types.ObjectId, ref: 'User'},   // 好友id
    nickname: {type: String},                               // 好友备注
    time: {type: Date},                                     // 好友关系建立时间
    state: {type: String},                                  // 好友状态，0好友，1申请方，2被申请方
})

// 一对一消息表
const MessageSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},     // 用户id
    friendId: {type: Schema.Types.ObjectId, ref: 'User'},   // 好友id
    content: {type: String},                                // 消息内容
    types: {type: String},                                  // 消息内容类型，0文字，1图片...
    time: {type: Date},                                     // 消息发送时间
    state: {type: Number},                                  // 消息状态，0已读，1未读
})

// 群表
const GroupSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},     // 群主id
    name: {type: String, unique: true},                     // 群名称
    imgUrl: {type: String, default: 'group.png'},           // 群头像链接
    notice: {type: String},                                 // 群公告
    time: {type: Date},                                     // 建立时间
})

// 群成员表
const GroupMemberSchema = new Schema({
    groupId: {type: Schema.Types.ObjectId, ref: 'Group'},   // 群id
    userId: {type: Schema.Types.ObjectId, ref: 'User'},     // 用户id
    name: {type: String},                                   // 群内昵称
    tip: {type: Number, default: 0},                        // 未读消息数
    time: {type: Date},                                     // 加入时间
    state: {type: Number},                                  // 状态，0正常，1屏蔽
})

// 群消息表
const GroupMsgSchema = new Schema({
    groupId: {type: Schema.Types.ObjectId, ref: 'Group'},   // 群id
    userId: {type: Schema.Types.ObjectId, ref: 'User'},     // 用户id
    content: {type: String},                                // 消息内容
    types: {type: String},                                  // 消息内容类型，0文字，1图片...
    time: {type: Date},                                     // 消息发送时间
})

module.exports = db.model('User', UserSchema)
module.exports = db.model('Friend', FriendSchema)
module.exports = db.model('Message', MessageSchema)
module.exports = db.model('Group', GroupSchema)
module.exports = db.model('GroupMember', GroupMemberSchema)
module.exports = db.model('GroupMsg', GroupMsgSchema)