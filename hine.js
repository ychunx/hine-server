const express = require("express");
const app = express();
const port = 3000;

// socket.io
const server = app.listen(3001);
const io = require("socket.io").listen(server);
require("./dao/socketserver")(io);

// body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// express.static
app.use(express.static("public"));

// 错误处理中间件
app.use((req, res, next) => {
  // 默认将 status 的值设置为 500，方便处理失败的情况
  res.cc = (err, status = 500) => {
    res.send({
      status,
      // 状态描述，如果 err 是错误对象则传回错误信息
      msg: err instanceof Error ? err.message : err,
    });
  };
  next();
});

// 路由
const router = require("./router");
app.use("/api", router);

// 404 页面
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// 兜底出错处理
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => console.log(`Hine 服务器已在 ${port} 端口启动！`));
