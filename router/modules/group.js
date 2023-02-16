// 群相关接口
const dbserver = require("../../dao/dbserver");

module.exports = (router) => {
  // 查询群组名称是否已被占用
  router.get("/group/nameinuse/:name", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };

    dbserver.countGroupName(req.params, callback);
  });

  // 新建群组
  router.post("/group/build", (req, res) => {
    let userId = req.jwt_id;
    let { name, imgUrl, friends } = req.body;
    let time = new Date();

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        let flag = null;
        let whereStr = {};
        friends.unshift(userId);

        friends.forEach((item) => {
          whereStr = {
            groupId: result._id,
            userId: item,
            time,
          };
          dbserver.addGroupMember(whereStr, (err, result) => {
            if (err) {
              flag = err;
            }
          });
        });

        if (flag) {
          res.cc(flag);
        } else {
          dbserver.insertGroupMsg({
            groupId: result._id,
            userId,
            content: "创建群组",
            types: "0",
          });
          res.cc("创建成功", 200);
        }
      }
    };

    dbserver.buildGroup({ userId, name, imgUrl, time }, callback);
  });

  // 根据群组 id 获取群组信息
  router.post("/group/getgroupinfobyid", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };

    dbserver.getGroupInfoById({ _id: req.body.groupId }, callback);
  });

  // 更改群组头像
  router.post("/group/updateportrait", (req, res) => {
    let userId = req.jwt_id;
    let _id = req.body.groupId;
    let imgUrl = req.body.imgUrl;

    let callback = (err, result) => {
      if (err) {
        res.cc(`无权或修改失败，${err}`);
      } else {
        res.cc("更新成功", 200);
      }
    };

    dbserver.updateGroupPortrait({ _id, userId }, imgUrl, callback);
  });

  //更改群组名称
  router.post("/group/updatename", (req, res) => {
    let userId = req.jwt_id;
    let _id = req.body.groupId;
    let name = req.body.newName;

    let callback = (err, result) => {
      if (err) {
        res.cc(`无权或修改失败，${err}`);
      } else {
        res.cc("更新成功", 200);
      }
    };

    dbserver.updateGroupName({ _id, userId }, name, callback);
  });

  // 更改群组公告
  router.post("/group/updatenotice", (req, res) => {
    let userId = req.jwt_id;
    let _id = req.body.groupId;
    let notice = req.body.newNotice;

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc("更新成功", 200);
      }
    };

    dbserver.updateGroupNotice({ _id, userId }, notice, callback);
  });

  // 邀请成员
  router.post("/group/invite", (req, res) => {
    let whereStr = {
      groupId: req.body.groupId,
      userId: req.body.userId,
    };

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        if (result) {
          res.cc("邀请成功", 200);
        } else {
          res.cc("该用户已在群组中", 201);
        }
      }
    };

    dbserver.addGroupMemberByInvite(whereStr, callback);
  });

  // 删除成员，同时删除其聊天记录
  router.post("/group/removegroupmember", (req, res) => {
    let userId = req.jwt_id;
    let groupId = req.body.groupId;
    let memberId = req.body.memberId;

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc("移除成功", 200);
      }
    };

    dbserver.removeGroupMember(
      {
        userId,
        groupId,
        memberId,
      },
      callback
    );
  });

  // 更改群内昵称
  router.post("/group/updatenickname", (req, res) => {
    let userId = req.jwt_id;
    let groupId = req.body.groupId;
    let name = req.body.newNickName;

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc("更新成功", 200);
      }
    };

    dbserver.updateGroupNickName({ groupId, userId }, name, callback);
  });

  // 退出群组，不会删除聊天记录
  router.post("/group/exitgroup", (req, res) => {
    let userId = req.jwt_id;
    let groupId = req.body.groupId;

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc("退出成功", 200);
      }
    };

    dbserver.deleteGroupMember({ groupId, userId }, callback);
  });

  // 解散群组
  router.post("/group/breakgroup", (req, res) => {
    let userId = req.jwt_id;
    let groupId = req.body.groupId;

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc("解散成功", 200);
      }
    };

    dbserver.deleteGroup({ groupId, userId }, callback);
  });
};
