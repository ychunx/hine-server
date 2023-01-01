const express = require('express')
const router = express.Router()

const dbserver = require('../dao/dbserver')
const emailserver = require('../dao/emailserver')

router.all('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')
    next()
})

require('./signUp')(router)
require('./signIn')(router)

module.exports = router