// 注册页接口
const dbserver = require("../../dao/dbserver");
const jsrsasign = require("jsrsasign");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const emailserver = require("../../dao/emailserver");

module.exports = (router) => {
  // 查询用户名是否已被占用，返回数量
  router.get("/signup/nameinuse/:name", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };
    dbserver.countUserName(req.params, callback);
  });

  // 查询邮箱是否已被占用，返回数量
  router.get("/signup/emailinuse/:email", (req, res) => {
    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        res.cc(result, 200);
      }
    };
    dbserver.countUserEmail(req.params, callback);
  });

  // 注册
  router.post("/signup/adduser", (req, res) => {
    // 生成 RSA 密钥对
    let rsaKeypair = jsrsasign.KEYUTIL.generateKeypair("RSA", 1024);
    let publicKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj);
    let privateKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS8PRV");

    let data = req.body;
    // 存取用户密码加密的密钥对
    //data.publicKey = CryptoJS.AES.encrypt(publicKey, data.pwd).toString()
    data.publicKey = publicKey;
    data.privateKey = CryptoJS.AES.encrypt(privateKey, data.pwd).toString();
    // 存取密码的哈希值
    data.pwd = bcrypt.hashSync(data.pwd, 10);
    data.birth = new Date();
    data.registerTime = new Date();

    let callback = (err, result) => {
      if (err) {
        res.cc(err);
      } else {
        emailserver.emailSignUp(data.name, data.email);
        res.cc("注册成功", 200);
      }
    };

    dbserver.buildUser(data, callback);
  });
};
