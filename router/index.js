const express = require('express')
const router = express.Router()
const dbserver = require('../dao/dbserver')

router.all('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')
    next()
})

router.get('/', (req, res) => {
    dbserver.findUser(res)
    //res.send(req.get('token'))
})

module.exports = router