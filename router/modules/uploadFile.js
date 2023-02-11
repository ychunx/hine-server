// 文件上传接口
const formidable = require("formidable");
const fs = require("fs");

const address = "http://localhost:3000";
const mkdirs = require("../../dao/mkdirs");

module.exports = (router) => {
  // 上传头像
  router.post("/upload/portrait", (req, res) => {
    const form = formidable({});

    form.parse(req, (err, fields, files) => {
      let { mimetype, newFilename, originalFilename, filepath } =
        files.portraitFile;
      if (mimetype.indexOf("image") != "-1") {
        let fileType = originalFilename.replace(/.+\./, "");
        let toPath = `./public/portraitImages/${newFilename}.${fileType}`;

        mkdirs.mkdir("../public/portraitImages", (err) => {
          if (err) {
            res.cc(err);
          } else {
            try {
              fs.copyFileSync(filepath, toPath);
              res.cc(
                `${address}/portraitImages/${newFilename}.${fileType}`,
                200
              );
            } catch (error) {
              res.cc(error);
            }
          }
        });
      } else {
        res.cc("上传文件非图片", 201);
      }
    });
  });

  // 上传群头像
  router.post("/upload/groupportrait", (req, res) => {
    const form = formidable({});

    form.parse(req, (err, fields, files) => {
      let { mimetype, newFilename, originalFilename, filepath } =
        files.groupPortraitFile;
      if (mimetype.indexOf("image") != "-1") {
        let fileType = originalFilename.replace(/.+\./, "");
        let toPath = `./public/groupPortraitImages/${newFilename}.${fileType}`;

        mkdirs.mkdir("../public/groupPortraitImages", (err) => {
          if (err) {
            res.cc(err);
          } else {
            try {
              fs.copyFileSync(filepath, toPath);
              res.cc(
                `${address}/groupPortraitImages/${newFilename}.${fileType}`,
                200
              );
            } catch (error) {
              res.cc(error);
            }
          }
        });
      } else {
        res.cc("上传文件非图片", 201);
      }
    });
  });

  // 上传聊天图片
  router.post("/upload/image", (req, res) => {
    const form = formidable({});

    form.parse(req, (err, fields, files) => {
      let { mimetype, newFilename, originalFilename, filepath } =
        files.uploadImgFile;
      if (mimetype.indexOf("image") != "-1") {
        let fileType = originalFilename.replace(/.+\./, "");
        let toPath = `./public/msgImages/${newFilename}.${fileType}`;

        mkdirs.mkdir("../public/msgImages", (err) => {
          if (err) {
            res.cc(err);
          } else {
            try {
              fs.copyFileSync(filepath, toPath);
              res.cc(`${address}/msgImages/${newFilename}.${fileType}`, 200);
            } catch (error) {
              res.cc(error);
            }
          }
        });
      } else {
        res.cc("上传文件非图片", 201);
      }
    });
  });
};
