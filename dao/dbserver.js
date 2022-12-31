const dbmodel = require('../model/dbmodel')

const User = dbmodel.model('User')

// 新建用户
exports.buildUser = (data, res) => {
    data.registerTime = new Date()
    let user = new User(data)
    user.save((err, result) => {
        if(err){
            res.cc(err)
        }else{
            res.cc('注册成功', 0)
        }
    })
}

// 查询用户名数量
exports.countUserName = (data, res) => {
    User.countDocuments(data, (err, result) => {
        if(err){
            res.cc(err)
        }else{
            res.cc(result, 0)
        }
    })
}

// 查询邮箱数量
exports.countUserEmail = (data, res) => {
    User.countDocuments(data, (err, result) => {
        if(err){
            res.cc(err)
        }else{
            res.cc(result, 0)
        }
    })
}