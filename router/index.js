const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../config/tokenConfig");

router.all("*", (req, res, next) => {
  // 跨域请求相关
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,token");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Content-Type", "application/json;charset=utf-8");

  // 判断是否需要并验证 token
  if (req.path.indexOf("signup") != -1 || req.path.indexOf("login") != -1) {
    next();
  } else {
    try {
      // 尝试验证 token 并把 token 所存储的用户 id 添加到 req 身上供后续使用
      let jwtRes = jwt.verify(req.get("token"), config.jwtSecretKey);
      req.jwt_id = jwtRes._id;
      next();
    } catch (error) {
      res.cc(`token 已失效，${error}`);
    }
  }
});

require("./modules/signUp")(router);
require("./modules/signIn")(router);
require("./modules/search")(router);
require("./modules/friend")(router);
require("./modules/chat")(router);
require("./modules/detail")(router);
require("./modules/uploadFile")(router);
require("./modules/group")(router);

module.exports = router;
