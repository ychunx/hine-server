const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const config = require('../config/tokenConfig')

router.all('*', (req, res, next) => {
    // 跨域请求相关
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')

    // 判断是否需要并验证 token
    let noTokenRequire = req.path.indexOf('signup') != -1 || req.path.indexOf('signin') != -1
    if (noTokenRequire) {
        next()
    } else {
        try {
            jwt.verify(req.get('token'), config.jwtSecretKey)
            next()
        } catch (error) {
            res.cc(error)
        }
    }
})

require('./modules/signUp')(router)
require('./modules/signIn')(router)
require('./modules/search')(router)
require('./modules/friend')(router)

module.exports = router