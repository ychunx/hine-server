const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'))

// 响应数据中间件
app.use((req, res, next) => {
    // status = 0 为成功，status = 1 为失败
    // 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = (err, status = 1) => {
        res.send({
            status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            msg: err instanceof Error ? err.message : err,
        })
    }
    next()
})

const router = require('./router')
app.use('/api', router)

// 404 页面
app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

// 出错处理
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send(err.message)
})

app.listen(port, () => console.log(`hine 服务器已在 ${port} 端口启动！`))