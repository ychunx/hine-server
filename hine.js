const express = require('express')
const app = express()
const port = 3000

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