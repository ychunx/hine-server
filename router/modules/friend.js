// 好友申请接口
const dbserver = require("../../dao/dbserver");

module.exports = (router) => {
  // 拒绝添加
  router.post("/friend/reject", (req, res) => {
    let userId = req.jwt_id;
    let friendId = req.body.friendId;
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc("拒绝成功", 200);
      }
    };
    dbserver.deleteFriendRelation({ userId, friendId }, callback);
  });

  // 删除好友
  router.post("/friend/delete", (req, res) => {
    let userId = req.jwt_id;
    let friendId = req.body.friendId;
    let callback1 = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        let callback2 = (err, result) => {
          if (err) {
            res.cc(err);
          } else {
            res.cc("删除成功", 200);
          }
        };
        dbserver.deleteFriendRelation({ userId, friendId }, callback2);
      }
    };
    // 删除聊天记录
    dbserver.deleteAllChatRecord({ userId, friendId }, callback1);
  });

  // 获取好友列表
  router.get("/friend/getfriends", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };
    dbserver.getFriends(req.jwt_id, callback);
  });

  // 获取好友申请列表
  router.get("/friend/getfriendapplys", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };
    dbserver.getFriendApplys(req.jwt_id, callback);
  });
};
