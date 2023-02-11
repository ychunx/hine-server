const fs = require("fs");
const path = require("path");

exports.mkdir = (pathname, callback) => {
  // 避免不必要的 bug
  pathname = path.isAbsolute(pathname)
    ? pathname
    : path.join(__dirname, pathname);
  pathname = path.relative(__dirname, pathname);
  // 避免平台差异
  let floders = pathname.split(path.sep);

  // 循环创建每级文件夹
  let pre = "";
  floders.forEach((item) => {
    try {
      // 判断存不存在，不存在会抛出错误
      fs.statSync(path.join(__dirname, pre, item));
    } catch (error) {
      try {
        // 不存在则创建
        fs.mkdirSync(path.join(__dirname, pre, item));
      } catch (error) {
        callback && callback(error);
        return;
      }
    }

    pre = path.join(pre, item);
  });

  callback && callback(null);
};
