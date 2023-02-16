const dbmodel = require("../model/dbmodel");

const User = dbmodel.model("User");
const Friend = dbmodel.model("Friend");
const Message = dbmodel.model("Message");
const Group = dbmodel.model("Group");
const GroupMember = dbmodel.model("GroupMember");
const GroupMessage = dbmodel.model("GroupMessage");

// 查询用户名数量
exports.countUserName = (whereStr, callback) => {
  User.countDocuments(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 查询邮箱数量
exports.countUserEmail = (whereStr, callback) => {
  User.countDocuments(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 新建用户
exports.buildUser = (whereStr, callback) => {
  let user = new User(whereStr);
  user.save((err, result) => {
    callback(err, result);
  });
};

// 用户登录
exports.matchUser = (whereStr, callback) => {
  User.findOne(whereStr, { pwd: 1 }, (err, result) => {
    callback(err, result);
  });
};

/*
 *
 *  以下的操作请求头都需要有token
 *
 */
// 获取用户信息
exports.getUserInfo = (_id, callback) => {
  let out = { pwd: 0 };

  User.findOne({ _id }, out, (err, result) => {
    callback(err, result);
  });
};

// 搜索用户
exports.searchUser = (key, callback) => {
  let whereStr = {
    $or: [{ name: { $regex: key } }, { email: { $regex: key } }],
  };
  let out = { name: 1, email: 1, imgUrl: 1 };

  User.find(whereStr, out, (err, result) => {
    callback(err, result);
  });
};

// 查询好友关系
exports.relationShip = (whereStr, callback) => {
  Friend.findOne(whereStr, { state: 1 }, (err, result) => {
    callback(err, result);
  });
};

// 搜索群
exports.searchGroup = (key, callback) => {
  let whereStr = { name: { $regex: key } };
  let out = { name: 1, imgUrl: 1 };

  Group.find(whereStr, out, (err, result) => {
    callback(err, result);
  });
};

// 用户是否为群成员
exports.isInGroup = (whereStr, callback) => {
  GroupMember.countDocuments(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 新建用户关系
exports.buildRelation = (data) => {
  let friend = new Friend(data);

  friend.save();
};

// 好友申请
exports.friendApply = (data) => {
  let userId = data.userId;
  let friendId = data.friendId;

  // 直接查询有没有任意种关系，无需查询两遍，因为建立关系时是双向的
  Friend.countDocuments({ userId, friendId }, (err, result) => {
    if (result == 0) {
      this.buildRelation({ userId, friendId, state: "1" });
      this.buildRelation({ userId: friendId, friendId: userId, state: "2" });
    }

    data.time = new Date();
    this.insertMsg(data);
  });
};

// 插入消息
exports.insertMsg = (data) => {
  let msg = new Message(data);

  msg.save();
};

// 修改好友关系
exports.updateFriendRelation = (whereStr, state) => {
  Friend.updateMany(whereStr, { state, time: new Date() }, (err, result) => {
    console.log(err, result);
  });
};

// 同意好友申请
exports.agreeApply = (data) => {
  Friend.findOne(data, { state: 1 }, (err, result) => {
    if (result.state && result.state == "2") {
      // 只有被申请方才能同意
      let whereStr = {
        $or: [data, { friendId: data.userId, userId: data.friendId }],
      };
      this.updateFriendRelation(whereStr, "0");
      let msg = { ...data };
      msg.content = "我们已经成为好友，可以开始聊天了！";
      msg.types = "0";
      msg.time = new Date();
      this.insertMsg(msg);
    }
    // else {
    //     res.cc('无权同意', 2)
    // }
  });
};

// 删除好友关系
exports.deleteFriendRelation = (data, callback) => {
  let whereStr = {
    $or: [data, { friendId: data.userId, userId: data.friendId }],
  };

  Friend.deleteMany(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 删除所有聊天记录
exports.deleteAllChatRecord = (data, callback) => {
  let whereStr = {
    $or: [data, { friendId: data.userId, userId: data.friendId }],
  };

  Message.deleteMany(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 删除聊天记录
exports.deleteChatRecord = (data, encrypted, callback) => {
  let whereStr = {
    $or: [data, { friendId: data.userId, userId: data.friendId }],
    encrypted,
  };

  Message.deleteMany(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 获取好友列表
exports.getFriends = (userId, callback) => {
  Friend.find(
    { userId, state: "0" },
    { friendId: 1, nickname: 1 },
    async (err, result) => {
      if (err) {
        callback(err);
      } else {
        let friendsInfo = [];
        let info = {};
        let out = { pwd: 0, privateKey: 0 };
        for (let i = 0; i < result.length; i++) {
          let res = await User.findOne({ _id: result[i].friendId }, out);
          info = { ...res._doc };
          info.nickname = result[i].nickname;
          friendsInfo.push(info);
        }
        callback("", friendsInfo);
      }
    }
  );
};

// 获取好友申请列表
exports.getFriendApplys = (userId, callback) => {
  Friend.find({ userId, state: "2" }, { friendId: 1 }, async (err, result) => {
    if (err) {
      callback(err);
    } else {
      let friendsInfo = [];
      let info = {};
      let msgs = [];
      let msg = [];

      for (let i = 0; i < result.length; i++) {
        info = await User.findOne(
          { _id: result[i].friendId },
          { name: 1, imgUrl: 1 }
        );
        friendsInfo.push(info);

        msg = await Message.find(
          { userId: result[i].friendId, friendId: userId },
          { content: 1, time: 1 }
        );
        msgs.push(msg);
      }

      let arr = friendsInfo.map((item, index) => {
        return {
          name: item.name,
          imgUrl: item.imgUrl,
          friendId: item._id,
          msgs: msgs[index],
        };
      });

      callback("", arr);
    }
  });
};

// 获取聊天记录
exports.getAllMsgs = (userId, encrypted, callback) => {
  let whereStr1 = { $or: [{ userId }, { friendId: userId }], encrypted };

  Message.find(whereStr1, async (err, result) => {
    if (err) {
      callback(err);
    } else {
      // 将所有消息整理成一个对象，对象包含一个用户的id和所有消息的数组
      let arr = result.reduce((prev, item) => {
        // 在上一个结果数组中寻找和当前id相同的对象的地址
        let friend = prev.find((prevItem) => {
          // 不管是接收方还是发送方都需要添加进数组
          return (
            String(prevItem.friendId) == String(item.userId) ||
            String(prevItem.friendId) == String(item.friendId)
          );
        });

        if (friend) {
          // 如果存在则直接将当前项（一个消息）push入该用户的消息数组
          friend.allMsgs.push(item);
        } else {
          // 如果不存在则直接添加进去一个新的用户对象，并传给下一次循环
          let data = {};
          // 若是第一次添加，则需要找出好友id
          if (userId == item.userId) {
            data.friendId = item.friendId;
          } else {
            data.friendId = item.userId;
          }
          data.allMsgs = [item];
          prev.push(data);
        }
        return prev;
      }, []);

      // 进一步处理
      if (arr.length > 0) {
        let newArr = [];
        let out = { name: 1, imgUrl: 1 };

        // 去除非好友的消息
        // 需要变量接收才不报错
        let a = await Promise.all(
          arr.map(async (item) => {
            let whereStr2 = { userId, friendId: item.friendId, state: "0" };

            let has = await Friend.countDocuments(whereStr2);
            if (has > 0) {
              // 顺便附带好友信息
              let info = await User.findOne({ _id: item.friendId }, out);
              item.name = info.name;
              item.imgUrl = info.imgUrl;
              let nicknameItem = await Friend.findOne(
                { userId, friendId: item.friendId },
                { nickname: 1 }
              );
              item.nickname = nicknameItem.nickname;

              newArr.push(item);
              return "ok";
            } else {
              return "ok";
            }
          })
        );

        // 计算未读消息数
        newArr.forEach((item1) => {
          let unReadNum = 0;

          item1.allMsgs.forEach((item2) => {
            if (!item2.read && item2.friendId == userId) {
              unReadNum++;
            }
          });

          item1.unReadNum = unReadNum;
        });

        callback("", newArr);
      } else {
        callback("", arr);
      }
    }
  });
};

// 已读单个好友发送的所有消息
exports.readFriendMsgs = (data, encrypted, callback) => {
  let whereStr = {
    userId: data.friendId,
    friendId: data.userId,
    read: false,
    encrypted,
  };

  Message.updateMany(whereStr, { read: true }, (err, result) => {
    callback(err, result);
  });
};

// 修改用户表集合
exports.updateUser = (whereStr, updateStr, callback) => {
  User.updateOne(whereStr, updateStr, (err, result) => {
    callback(err, result);
  });
};

exports.getCipher = (whereStr, callback) => {
  let out = { pwd: 1, privateKey: 1, publicKey: 1 };
  User.findOne(whereStr, out, (err, result) => {
    callback(err, result);
  });
};

// 修改好友表集合
exports.updateFriend = (whereStr, updateStr, callback) => {
  Friend.updateOne(whereStr, updateStr, (err, result) => {
    callback(err, result);
  });
};

// 查询群名称数量
exports.countGroupName = (whereStr, callback) => {
  Group.countDocuments(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 新建群组
exports.buildGroup = (whereStr, callback) => {
  let group = new Group(whereStr);
  group.save((err, result) => {
    callback(err, result);
  });
};

// 添加群组成员
exports.addGroupMember = (whereStr, callback) => {
  let groupMember = new GroupMember(whereStr);
  groupMember.save((err, result) => {
    callback(err, result);
  });
};
exports.addGroupMemberByInvite = async (whereStr, callback) => {
  try {
    let res = await GroupMember.countDocuments(whereStr);
    if (res < 1) {
      whereStr.time = new Date();
      let groupMember = new GroupMember(whereStr);
      groupMember.save();
      callback(null, true);
    } else {
      // 已存在
      callback(null, false);
    }
  } catch (error) {
    callback(error);
  }
};

// 插入群组消息
exports.insertGroupMsg = async (data) => {
  data.time = new Date();

  let groupMsg = new GroupMessage(data);
  await groupMsg.save();
  await GroupMember.updateMany(
    { groupId: data.groupId },
    { $inc: { unReadNum: 1 } }
  );
  // 除了自己都增加未读、因为发送信息则一定在聊天页面故 unReadNum 可以直接为 0
  await GroupMember.updateOne(
    { groupId: data.groupId, userId: data.userId },
    { unReadNum: 0 }
  );
};

// 已读群组所有消息
exports.readGroupMsgs = (whereStr, callback) => {
  GroupMember.updateOne(whereStr, { unReadNum: "0" }, (err, result) => {
    callback(err, result);
  });
};

// 获取所有群组消息和信息
exports.getAllGroupMsgs = async (whereStr, callback) => {
  try {
    let groups = await GroupMember.find(whereStr, { userId: 0 });

    let groupInfos = [];
    await Promise.all(
      groups.map(async (item) => {
        let info = await Group.findOne({ _id: item.groupId });
        groupInfos.push(info);
        return "ok";
      })
    );

    let groupMsgs = [];
    await Promise.all(
      groups.map(async (item) => {
        let msgs = await GroupMessage.find({ groupId: item.groupId });
        groupMsgs.push(msgs);
      })
    );

    let allGroupMsgs = [];
    groups.forEach((item) => {
      let msgs = {};
      msgs.groupId = item.groupId;
      msgs.nickName = item.name;
      msgs.unReadNum = item.unReadNum;
      msgs.joinTime = item.time;

      groupInfos.forEach((info) => {
        if (String(item.groupId) == String(info._id)) {
          msgs.name = info.name;
          msgs.userId = info.userId;
          msgs.imgUrl = info.imgUrl;
          msgs.notice = info.notice;
          msgs.time = info.time;
        }
      });

      groupMsgs.forEach((msg) => {
        if (String(item.groupId) == String(msg[0].groupId)) {
          msgs.allMsgs = msg;
        }
      });

      allGroupMsgs.push(msgs);
    });

    // 查询每个群的群成员信息
    let userInfos = [];
    await Promise.all(
      groups.map(async (item) => {
        let users = await GroupMember.find(
          { groupId: item.groupId },
          { userId: 1, name: 1 }
        );

        let infos = [];
        await Promise.all(
          users.map(async (user) => {
            let info = await User.findOne(
              { _id: user.userId },
              { name: 1, imgUrl: 1 }
            );

            let data = {};
            data._id = info._id;
            data.name = info.name;
            data.imgUrl = info.imgUrl;
            data.nickName = user.name;

            infos.push(data);
          })
        );

        userInfos.push({ groupId: item.groupId, memberInfos: infos });
      })
    );

    callback(null, { groupMsgs: allGroupMsgs, userInfos });
  } catch (error) {
    callback(error);
  }
};

// 查询群组成员 id
exports.getGroupMembers = (whereStr, callback) => {
  GroupMember.find(whereStr, { userId: 1 }, (err, result) => {
    callback(err, result);
  });
};

// 添加群组成员
exports.addGroupMember = (data) => {
  let user = new GroupMember(data);

  user.save();
};

// 根据 id 获取用户信息
exports.getUserInfoById = (whereStr, callback) => {
  User.findOne(
    whereStr,
    { pwd: 0, privateKey: 0, publicKey: 0 },
    (err, result) => {
      callback(err, result);
    }
  );
};

// 根据 id 获取群组信息
exports.getGroupInfoById = async (whereStr, callback) => {
  try {
    let groupInfo = await Group.findOne(whereStr);

    let users = await GroupMember.find({ groupId: whereStr }, { userId: 1 });
    let memberInfos = [];
    await Promise.all(
      users.map(async (user) => {
        let info = await User.findOne(
          { _id: user.userId },
          { name: 1, imgUrl: 1 }
        );

        let data = {};
        data._id = info._id;
        data.name = info.name;
        data.imgUrl = info.imgUrl;

        memberInfos.push(data);
      })
    );

    callback(null, { groupInfo, memberInfos });
  } catch (error) {
    callback(error);
  }
};

// 更改群组头像
exports.updateGroupPortrait = (whereStr, imgUrl, callback) => {
  Group.updateOne(whereStr, { imgUrl }, (err, result) => {
    callback(err, result);
  });
};

// 更改群组名称
exports.updateGroupName = (whereStr, name, callback) => {
  Group.updateOne(whereStr, { name }, (err, result) => {
    console.log(err, result);
    callback(err, result);
  });
};

// 更改群组公告
exports.updateGroupNotice = (whereStr, notice, callback) => {
  Group.updateOne(whereStr, { notice }, (err, result) => {
    callback(err, result);
  });
};

// 更改群内昵称
exports.updateGroupNickName = (whereStr, name, callback) => {
  GroupMember.updateOne(whereStr, { name }, (err, result) => {
    callback(err, result);
  });
};

// 移除群组成员
exports.removeGroupMember = async (data, callback) => {
  let whereStr1 = {
    groupId: data.groupId,
    userId: data.userId,
  };
  let whereStr2 = {
    groupId: data.groupId,
    userId: data.memberId,
  };

  try {
    // 先判断该用户是不是群主
    let isLeader = await Group.countDocuments(whereStr1);
    console.log(isLeader);
    if (isLeader > 0) {
      this.deleteGroupMember(whereStr2, (err, result) => {
        if (!err) {
          this.deleteGroupChatRecord(whereStr2);
        }
      });

      callback(null, "移除成功");
    } else {
      callback(null, "没有权限");
    }
  } catch (error) {
    callback(error);
  }
};

// 删除群组成员
exports.deleteGroupMember = (whereStr, callback) => {
  GroupMember.deleteOne(whereStr, (err, result) => {
    callback(err, result);
  });
};

// 删除群组
exports.deleteGroup = (whereStr, callback) => {
  Group.deleteOne(whereStr, (err, result) => {
    if (err) {
      callback(err);
    } else {
      try {
        this.deleteGroupChatRecord({ grouId: whereStr.grouId });
        this.deleteGroupMembersRecord({ grouId: whereStr.grouId });
      } catch (error) {
        callback(error);
      }
    }
  });
};

// 删除群组聊天记录
exports.deleteGroupChatRecord = (whereStr) => {
  GroupMessage.deleteMany(whereStr, (err, result) => {
    console.log(err, result);
  });
};

// 删除群组成员记录
exports.deleteGroupMembersRecord = (whereStr) => {
  GroupMember.deleteMany(whereStr, (err, result) => {
    console.log(err, result);
  });
};
