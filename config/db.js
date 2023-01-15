const mongoose = require('mongoose')

const db = mongoose.createConnection('mongodb://127.0.0.1:27017/hine')

db.on('error', console.error.bind(console, '连接失败！'))

db.once('open', () => {
  console.log('数据库 hine 连接成功！')
})

module.exports = db