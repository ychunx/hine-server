const mongoose = require('mongoose')

const db = mongoose.createConnection('mongodb://127.0.0.1:27017/hine')
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  console.info('数据库 hine 连接成功！')
})

module.exports = db