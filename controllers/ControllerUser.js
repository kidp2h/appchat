const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const {
    bodyParser,
    validator,
    xss,
    axios,
    db,
    passport
} = require("../routes/requireLib");
const fse = require("fs-extra");


//--> interactive with model
let addNewUserToCollection = async (username, password) => {
    var checkUsername = await UserModel.findUser(username);
    if (checkUsername == null) {
        let result = await UserModel.registerUser(username, password);
        return true;
    }
    return false;
}

let checkPwd = (passwordToCompare, passwordHashed) => {
    return bcrypt.compareSync(passwordToCompare, passwordHashed);
}

let loginApp = async (username, password) => {
    var checkAccount = await UserModel.findUser(username);
    if (checkAccount != null && checkPwd(password, checkAccount.password) == true) {
        return checkAccount;
    }
    return false

}

let getInfoUser = async (username) => {
    let infoUser = await UserModel.findUser(username);
    return infoUser;
}

let getInfoUserById = async (userId) => {
    let infoUser = await UserModel.findUserById(userId);
    return infoUser;
}

let getAllUser = async (userId) => {
    let allUser = await UserModel.getAllUser(userId);
    return allUser;
}

let updateUserByJSON = async (user, info) => {
    let userId = user._id;
    if (info.currentPwd) {
        let resultCheck = checkPwd(info.currentPwd, user.password); // check current password
        if (resultCheck == true) {
            await UserModel.updateInfo(userId, info);
            return true;
        } else {
            return false;
        }
    } else {
        await UserModel.updateInfo(userId, info);
        return true;
    }
}
//interactive with model <--

let registerAccount = async (req, res) => {
    try {
        let username = xss(req.body.username)
        let password = xss(req.body.password)
        let retypePwd = xss(req.body.retypePwd)
        // check input from ajax
        if (validator.isEmpty(username) == true || validator.isEmpty(password) == true || validator.isEmpty(retypePwd) == true || validator.isEmpty(req.body.captchaRes) == true) {
            return res.json({
                "msg": "Không được để trống !!!"
            })
        } else if (validator.isAlpha(username) == false && validator.isAlphanumeric(username) == false) {
            return res.json({
                "msg": "Tên tài khoản không được chứa ký tự lạ"
            })
        } else if (username.length < 4 || username.length > 15 || password.length < 4 || password != retypePwd) {
            return res.json({
                "msg": "Mật khẩu có độ dài ít nhất là 4, tên tài khoản có độ dài khoảng từ 5 đến 15 ký tự"
            })
        } else {
            //verify captcha
            var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.SECRET_KEY + "&response=" + req.body.captchaRes + "&remoteip=" + req.connection.remoteAddress;
            const response = await axios.get(verificationUrl);
            // check verify
            if (response.success !== undefined && !response.success) {
                return res.json({
                    "responseCode": 1,
                    "responseDesc": "Failed captcha verification"
                });
            } else {
                var result = await addNewUserToCollection(username, password);
                if (result == true) {
                    return res.json({
                        "responseCode": 0,
                        "responseDesc": "Sucess",
                        "register": true
                    });
                } else {
                    return res.json({
                        "responseCode": 0,
                        "responseDesc": "Sucess",
                        "register": false,
                        "msg": "Tài khoản đã tồn tại"
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

let updateAvatar = async (req, res) => {
    let user = req.session.passport.user;
    let userId = user._id;
    let infoFile = req.file;

    if (infoFile.mimetype == "image/jpeg" || infoFile.mimetype == "image/png" || infoFile.mimetype == "image/jpg") {
        let srcAvatar = `/images/avatars/${infoFile.filename}`
        let prevImage = await UserModel.findImageCurrent(userId);
            prevImage = prevImage[0].avatar
        let result = await UserModel.updateAvatarUser(userId, srcAvatar);

        if (prevImage == process.env.AVATAR_DEFAULT) {

        } else {
            let regexp = new RegExp(/([A-Z])\w+.*/g)
            prevImage = prevImage.match(regexp);
            fse.remove(`${process.env.AVATAR_STORAGE}/${prevImage}`);
        }
        if (result) {
            res.json({
                status: true
            })
        }
    } else {
        res.json({
            status: false
        })
    }
}


let updateInfoUser = async (req,res) => {
    let info = req.body
    let user = req.session.passport.user
    if(info.currentPwd == undefined || info.password == undefined){

         let result = await updateUserByJSON(user,info)

        if(result){
            res.json(true)
        }else{
            res.json({message :"Cập nhật thất bại"})
        }

    }else if(info.currentPwd == info.password){
        res.json(false);
    }else if(info.password.length < 4){
        res.json(false)
    }else{
        let result = await updateUserByJSON(user,info)
        if(result == true){
            res.json(true)
        }else{
            res.json({message :"Mật khẩu hiện tại không đúng !!"})
        }
    }
}

module.exports = {
    registerAccount: registerAccount,
    loginApp: loginApp,
    getInfoUser: getInfoUser,
    getAllUser: getAllUser,
    updateAvatar: updateAvatar,
    getInfoUserById: getInfoUserById,
    updateInfoUser: updateInfoUser,
}
