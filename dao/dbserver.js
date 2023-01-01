const dbmodel = require('../model/dbmodel')

const User = dbmodel.model('User')

// 新建用户
exports.buildUser = (data, res) => {
    data.registerTime = new Date()
    let user = new User(data)
    user.save((err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc('注册成功', 0)
        }
    })
}

// 查询用户名数量
exports.countUserName = (data, res) => {
    User.countDocuments(data, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
}

// 查询邮箱数量
exports.countUserEmail = (data, res) => {
    User.countDocuments(data, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            res.cc(result, 0)
        }
    })
}

// 用户登录
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/tokenConfig')
exports.matchUser = (data, type, res) => {
    let whereStr = {}
    whereStr[type] = data[type]
    let out = { 'name': 1, 'email': 1, 'psw': 1, 'imgUrl': 1 }
    User.find(whereStr, out, (err, result) => {
        if (err) {
            res.cc(err)
        } else {
            if (result == '') {
                res.cc('用户不存在', 2)
            } else {
                let matchPsw = bcrypt.compareSync(data.psw, result[0].psw)
                if (!matchPsw) {
                    res.cc('密码错误', 2)
                } else {
                    // 剔除密码，token 保留用户名、邮箱、头像链接、用户id
                    let user = { ...result[0], psw: '' }
                    let tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
                    let backInfo = {
                        name: result[0].name,
                        imgUrl: result[0].imgUrl,
                        token: 'Bearer ' + tokenStr,
                    }
                    res.cc(backInfo, 0)
                }
            }
        }
    })
}