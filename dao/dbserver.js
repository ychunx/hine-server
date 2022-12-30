const dbmodel = require('../model/dbmodel')

const User = dbmodel.model('User')

exports.findUser = (res) => {
    User.find((err, val) => {
        if(err){
            console.log('用户查询失败' + err)
        }else{
            res.send(val)
        }
    })
}