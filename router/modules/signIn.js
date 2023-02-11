// 登录页接口
const dbserver = require("../../dao/dbserver");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/tokenConfig");

module.exports = (router) => {
  router.post("/signin/login", (req, res) => {
    let pwd = req.body.pwd;

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        if (!result || result == "") {
          res.cc("账号或密码错误", 201);
        } else {
          let matchPwd = bcrypt.compareSync(pwd, result.pwd);
          if (!matchPwd) {
            res.cc("账号或密码错误", 201);
          } else {
            // token 存储用户id和登录时间
            let user = { _id: result._id, loginTime: new Date() };
            let token = jwt.sign(user, config.jwtSecretKey, {
              expiresIn: config.expiresIn,
            });
            res.cc(token, 200);
          }
        }
      }
    };

    // 判断传过来的是用户名还是邮箱地址
    let regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
    let isEmail = regEmail.test(req.body.acct);
    let data = {};

    if (isEmail) {
      data.email = req.body.acct;
    } else {
      data.name = req.body.acct;
    }
    dbserver.matchUser(data, callback);
  });

  router.get("/signin/getUserInfo", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };
    dbserver.getUserInfo(req.jwt_id, callback);
  });
};
