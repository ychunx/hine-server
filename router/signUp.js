// 注册页接口
const dbserver = require('../dao/dbserver')
const jsrsasign = require('jsrsasign')
const bcrypt = require('bcryptjs')
const CryptoJS = require('crypto-js')

module.exports = (router) => {
    // 注册
    router.post('/signup/adduser', (req, res) => {
        // 生成 RSA 密钥对
        let rsaKeypair = jsrsasign.KEYUTIL.generateKeypair('RSA', 1024);
        let publicKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj);
        let privateKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, 'PKCS8PRV');

        let data = req.body
        // 存取用户密码加密的密钥对
        data.publicKey = CryptoJS.AES.encrypt(publicKey, data.psw).toString()
        data.privateKey = CryptoJS.AES.encrypt(privateKey, data.psw).toString()
        // 存取密码的哈希值
        data.psw = bcrypt.hashSync(data.psw, 10)

        dbserver.buildUser(data, res)
    })

    // 查询用户名是否已被占用
    router.get('/signup/nameinuse/:name', (req, res) => {
        dbserver.countUserName(req.params, res)
    })

    // 查询邮箱是否已被占用
    router.get('/signup/emailinuse/:email', (req, res) => {
        dbserver.countUserEmail(req.params, res)
    })
}