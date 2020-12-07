let configStorage = () => {
    const multer = require("multer");
    const {
        Base64
    } = require('js-base64');
    const path = require("path");
    
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "../simple-chat/public/images/avatars")
        },
        filename: (req, file, cb) => {
            let extFile = path.extname(file.originalname);
            let fileName = Base64.fromUint8Array(file.fieldname + "-" + Date.now(), true)
            let resultFileName = fileName + extFile;
            nameFileToHandle = resultFileName
            cb(null, resultFileName);
        }
    })
    var upload = multer({
        storage: storage
    });
    return upload;
}
module.exports = {
    configStorage : configStorage
}

