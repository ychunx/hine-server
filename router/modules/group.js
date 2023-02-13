// 群相关接口
const dbserver = require("../../dao/dbserver");

module.exports = (router) => {
  // 查询群名称是否已被占用
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

  // 根据 id 获取群组信息
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
};
