const nodemailer = require("nodemailer");
const secret = require("../config/secret");

const transporter = nodemailer.createTransport({
  service: "qq",
  auth: {
    user: secret.qq.user,
    pass: secret.qq.pass,
  },
});

exports.emailSignUp = (name, address) => {
  let options = {
    from: "ychunx@qq.com",
    to: address,
    subject: `[Hine]${name}，您好，感谢您注册使用Hine！`,
    html: `<p>欢迎！</p><p>尊敬的${name}，您已经注册成为 Hine 的用户。</p><p>如果您有任何疑问和建议，可以联系官方客服 QQ：1582398700。</p>`,
  };

  transporter.sendMail(options, (err) => {
    if (err) {
      console.log("邮件发送失败！");
    } else {
      console.log("邮件发送成功！");
    }
  });
};
