const dbserver = require("./dbserver");

module.exports = (io) => {
  let socketList = {};

  io.on("connection", (socket) => {
    console.log(`${socket.id}连接 socket.io 成功！`);

    // 登录上线，一个账号只能一处登录
    socket.on("online", (userId) => {
      let toId = socketList[userId];
      if (toId) {
        socket.to(toId).emit("forceOffline");
      }
      socketList[userId] = socket.id;
      console.log(1, socketList);
    });

    // 登出下线
    socket.on("offline", (userId) => {
      delete socketList[userId];
      console.log(2, socketList);
    });

    // 发送消息
    socket.on("sendMsg", (data) => {
      let toId = socketList[data.friendId];
      dbserver.insertMsg(data);
      if (toId) {
        if (data.encrypted) {
          socket.to(toId).emit("receiveEncryptedMsg", data);
        } else {
          socket.to(toId).emit("receiveMsg", data);
        }
      }
    });

    // 申请添加好友
    socket.on("friendApply", (data) => {
      let toId = socketList[data.friendId];
      if (data.content == "") {
        data.content = "请求添加好友";
      }
      dbserver.friendApply(data);
      if (toId) {
        socket.to(toId).emit("receiveApply");
      }
    });

    // 同意好友请求
    socket.on("agreeApply", (data) => {
      let toId = socketList[data.friendId];
      dbserver.agreeApply(data);
      socket.emit("acceptedApply");
      if (toId) {
        socket.to(toId).emit("acceptedApply");
      }
    });

    // 发送群组消息
    socket.on("sendGroupMsg", (data) => {
      dbserver.insertGroupMsg(data);
      let groupId = data.groupId;
      dbserver.getGroupMembers({ groupId }, (err, result) => {
        if (!err) {
          result.forEach((item) => {
            let toId = socketList[item.userId];
            if (toId && item.userId != data.userId) {
              socket.to(toId).emit("receiveGroupMsg", data);
            }
          });
        }
      });
    });

    // 申请加入群组
    socket.on("groupApply", (data) => {
      let { groupId, userId, content, types } = data;
      let time = new Date();
      if (content == "") {
        content = "加入了群组";
      }

      dbserver.addGroupMember({
        groupId,
        userId,
        time,
      });

      dbserver.insertGroupMsg({
        groupId,
        userId,
        time,
        content,
        types,
      });

      dbserver.getGroupMembers({ groupId }, (err, result) => {
        if (!err) {
          result.forEach((item) => {
            let toId = socketList[item.userId];
            if (toId) {
              socket.to(toId).emit("newGroupMemberJoin");
            }
          });
        }
      });
    });
  });
};
