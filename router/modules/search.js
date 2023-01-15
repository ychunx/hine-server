// 搜索页接口
const dbserver = require('../../dao/dbserver')

module.exports = (router) => {
    // 搜索用户
    router.post('/search/user', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.searchUser(req.body.key, callback)
    })

    // 查询好友关系
    router.post('/search/relation', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else if(result) {
                if (result.state == '0') {
                    res.cc('双方是好友', 200)
                } else if (result.state == '1') {
                    res.cc('申请中', 201)
                } else {
                    res.cc('对方已发出申请', 202)
                }
            } else {
                res.cc('双方非好友', 203)
            }
        }
        dbserver.relationShip(req.body, callback)
    })

    // 搜索群
    router.post('/search/group', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                res.cc(result, 200)
            }
        }
        dbserver.searchGroup(req.body.key, callback)
    })

    // 查询用户是否为群内成员
    router.post('/search/isingroup', (req, res) => {
        let callback = (err, result) => {
            if (err) {
                res.cc(err)
            } else {
                if (result == 0) {
                    res.cc('非群内成员', 201)
                } else {
                    res.cc('用户在群内', 200)
                }
            }
        }
        dbserver.isInGroup(req.body, callback)
    })
}