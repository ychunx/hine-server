// 修改资料的接口
const dbserver = require('../../dao/dbserver')

const bcrypt = require('bcryptjs')
const CryptoJS = require('crypto-js')

module.exports = (router) => {
    // 修改用户名（需要密码）
    router.post('/detail/name', (req, res) => {
        let {pwd, newName} = req.body
        let _id = req.jwt_id

        let callback1 = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                let matchPwd = bcrypt.compareSync(pwd, result.pwd)
                if (!matchPwd) {
                    res.cc('密码错误', 201)
                } else {
                    let callback2 = (err, result) => {
                        if (err) {
                            res.cc(err)
                        } else {
                            if (result > 0) {
                                res.cc('用户名已被占用', 202)
                            } else {
                                let callback3 = (err, result) => {
                                    if (err) {
                                        res.cc(err)
                                    } else {
                                        res.cc('修改成功', 200)
                                    }
                                }

                                dbserver.updateUser({_id}, {name: newName}, callback3)
                            }
                        }
                    }

                    dbserver.countUserName({name: newName}, callback2)
                }
            }
        }

        dbserver.matchUser({_id}, callback1)
    })

    // 修改邮箱地址（需要密码）
    router.post('/detail/email', (req, res) => {
        let {pwd, newEmail} = req.body
        let _id = req.jwt_id

        let callback1 = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                let matchPwd = bcrypt.compareSync(pwd, result.pwd)
                if (!matchPwd) {
                    res.cc('密码错误', 201)
                } else {
                    let regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                    let isEmail = regEmail.test(newEmail)
                    if (!isEmail) {
                        res.cc('邮箱格式错误', 203)
                    } else {
                        let callback2 = (err, result) => {
                            if (err) {
                                res.cc(err)
                            } else {
                                if (result > 0) {
                                    res.cc('邮箱已被占用', 202)
                                } else {
                                    let callback3 = (err, result) => {
                                        if (err) {
                                            res.cc(err)
                                        } else {
                                            res.cc('修改成功', 200)
                                        }
                                    }

                                    dbserver.updateUser({_id}, {email: newEmail}, callback3)
                                }
                            }
                        }

                        dbserver.countUserEmail({email: newEmail}, callback2)
                    }
                }
            }
        }

        dbserver.matchUser({_id}, callback1)
    })

    // 修改密码（需要原密码）
    router.post('/detail/pwd', (req, res) => {
        let {pwd, newPwd} = req.body
        let _id = req.jwt_id

        let callback1 = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                let matchPwd = bcrypt.compareSync(pwd, result.pwd)
                if (!matchPwd) {
                    res.cc('原密码错误', 201)
                } else {
                    // 根据旧密码解密出原 RSA 密钥对
                    let bytes1  = CryptoJS.AES.decrypt(result.privateKey, pwd)
                    let bytes2  = CryptoJS.AES.decrypt(result.publicKey, pwd)
                    let privateKey = bytes1.toString(CryptoJS.enc.Utf8)
                    let publicKey = bytes2.toString(CryptoJS.enc.Utf8)

                    // 更新新密码加密的密钥对和新密码的哈希值
                    let data = {}
                    data.pwd = bcrypt.hashSync(newPwd, 10)
                    data.privateKey = CryptoJS.AES.encrypt(privateKey, newPwd).toString()
                    data.publicKey = CryptoJS.AES.encrypt(publicKey, newPwd).toString()

                    let callback2 = (err, result) => {
                        if (err) {
                            res.cc(err)
                        } else {
                            res.cc('修改成功', 200)
                        }
                    }

                    dbserver.updateUser({_id}, data, callback2)
                }
            }
        }

        dbserver.getCipher({_id}, callback1)
    })

    // 修改性别
    router.post('/detail/sex', (req, res) => {
        let _id = req.jwt_id
        let sex = req.body.newSex
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('修改成功', 200)
            }
        }

        dbserver.updateUser({_id}, {sex}, callback)
    })

    // 修改生日
    router.post('/detail/birth', (req, res) => {
        let _id = req.jwt_id
        let birth = new Date(req.body.newBirth)
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('修改成功', 200)
            }
        }

        dbserver.updateUser({_id}, {birth}, callback)
    })

    // 修改个性签名
    router.post('/detail/signature', (req, res) => {
        let _id = req.jwt_id
        let signature = req.body.signature
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('修改成功', 200)
            }
        }

        dbserver.updateUser({_id}, {signature}, callback)
    })

    // 修改头像，没写完，需要上传头像至服务器后得到头像链接再调用接口
    router.post('/detail/imgurl', (req, res) => {
        let _id = req.jwt_id
        let imgUrl = req.body.newImgUrl
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc('修改成功', 200)
            }
        }

        dbserver.updateUser({_id}, {imgUrl}, callback)
    })
}