const mongoose = require("mongoose");
const db = require("../config/db");

const Schema = mongoose.Schema;

// 用户表
const UserSchema = new Schema({
  email: { type: String, unique: true }, // 邮箱（唯一）
  name: { type: String, unique: true }, // 用户名（唯一）
  pwd: { type: String }, // 加密后的密码
  privateKey: { type: String }, // 加密后的私钥
  publicKey: { type: String }, // 加密后的公钥
  sex: { type: String, default: "你猜猜~" }, // 性别
  birth: { type: Date }, // 出生日期
  signature: { type: String, default: "ta很懒，什么都没有留下~" }, // 个性签名
  imgUrl: { type: String, default: "http://localhost:3000/user.png" }, // 头像链接
  registerTime: { type: Date }, // 注册时间
});

// 好友表
const FriendSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // 用户id
  friendId: { type: Schema.Types.ObjectId, ref: "User" }, // 好友id
  nickname: { type: String }, // 好友备注
  time: { type: Date }, // 好友关系建立时间
  state: { type: String }, // 好友状态，0好友，1申请方，2被申请方
});

// 一对一消息表
const MessageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // 发送方id
  friendId: { type: Schema.Types.ObjectId, ref: "User" }, // 接收方id
  content: { type: String }, // 消息内容
  types: { type: String }, // 消息类型，0文字，1图片...
  time: { type: Date }, // 消息发送时间
  read: { type: Boolean, default: false }, // 是否已读
  encrypted: { type: Boolean, default: false }, // 是否为加密消息
});

// 群表
const GroupSchema = new Schema({
  name: { type: String, unique: true }, // 群名称（唯一）
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // 群主id
  imgUrl: { type: String, default: "http://localhost:3000/user.jpg" }, // 群头像链接
  notice: { type: String, default: "无" }, // 群公告
  time: { type: Date }, // 建立时间
});

// 群成员表
const GroupMemberSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group" }, // 群id
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // 用户id
  name: { type: String }, // 群内昵称
  unReadNum: { type: Number, default: 0 }, // 未读消息数
  time: { type: Date }, // 加入时间
});

// 群消息表
const GroupMessageSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group" }, // 群id
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // 发送者id
  content: { type: String }, // 消息内容
  types: { type: String }, // 消息类型，0文字，1图片...
  time: { type: Date }, // 消息发送时间
});

module.exports = db.model("User", UserSchema);
module.exports = db.model("Friend", FriendSchema);
module.exports = db.model("Message", MessageSchema);
module.exports = db.model("Group", GroupSchema);
module.exports = db.model("GroupMember", GroupMemberSchema);
module.exports = db.model("GroupMessage", GroupMessageSchema);
