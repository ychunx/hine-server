// 文件上传接口
const formidable = require('formidable')
const fs = require('fs')

const mkdirs = require('../../dao/mkdirs')

module.exports = (router) => {
    // 上传头像
    router.post('/upload/portrait', (req, res) => {
        const form = formidable({ });

        form.parse(req, (err, fields, files) => {
            let { mimetype, newFilename, originalFilename, filepath } = files.portraitFile
            if (mimetype.indexOf('image') != '-1') {
                let fileType = originalFilename.replace(/.+\./, '')
                let toPath = `./public/portraitImages/${newFilename}.${fileType}`

                mkdirs.mkdir('../public/portraitImages', (err) => {
                    if (err) {
                        res.cc(err)
                    } else {
                        try {
                            fs.copyFileSync(filepath, toPath)
                            res.cc(`http://localhost:3000/portraitImages/${newFilename}.${fileType}`, 200)
                        } catch (error) {
                            res.cc(error)
                        }
                    }
                })
            } else {
                res.cc('上传文件非图片', 201)
            }
        })
    })
}
