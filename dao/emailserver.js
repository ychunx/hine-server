const nodemailer = require('nodemailer')
const secret = require('../config/secret')

const transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: secret.qq.user,
        pass: secret.qq.pass
    }
})

exports.emailSignUp = (address, res) => {
    let options = {
        from: 'ychunx@qq.com',
        to: address,
        subject: '感谢您注册使用Hine！',
        html: '<p>欢迎！</p><br><a href="#">点击验证激活</a>'
    }

    transporter.sendMail(options, (err, msg) => {
        if(err){
            res.send('邮件发送失败！')
        }else{
            res.send('邮件发送成功！')
        }
    })
}