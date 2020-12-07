require('dotenv').config();
const ControllerContact = require('../controllers/ControllerContact');
const ControllerUser = require('../controllers/ControllerUser');
const {RenderAuth,RenderMain} = require("../render/index");

const axios = require("axios");

let checkLogin = async (req, res, next) => {
    if (req.isAuthenticated()) {
        let user = req.session.passport.user;
        let infoUser = await ControllerUser.getInfoUserById(user._id);
        let allContactToAdd = await ControllerContact.getAllContactsToAdd(user._id)
        let allContactWaitAccept = await ControllerContact.getAllContactWaitAccept(user._id)
        let allContactIsFriend = await ControllerContact.getAllContactIsFriend(user._id)
        let countFriend = await ControllerContact.getCountFriend(user._id);

        res.render("index", {
            userRecord: infoUser,
            allContactToAdd: allContactToAdd,
            allContactWaitAccept: allContactWaitAccept,
            allContactIsFriend: allContactIsFriend,
            countFriend: countFriend
        })
    } else {
        next();
    }
}

let checkAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.render('sign-in', {
            siteKey: process.env.SITE_KEY //site key captcha
        })
    }
}


let logout = (req, res) => {
    req.logout();
    res.render("sign-in", {
        siteKey: process.env.SITE_KEY //site key captcha
    })
}

let checkCaptcha = async (req, res, next) => {
    let urlVerify = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.SECRET_KEY + "&response=" + req.body.captchaRes + "&remoteip=" + req.connection.remoteAddress;

    let response = await axios.get(urlVerify)
    if (response.data.success == false) {
        return res.json(404).end()
    } else {
        next();
    }
}

module.exports = {
    checkLogin: checkLogin,
    logout: logout,
    checkCaptcha: checkCaptcha,
    checkAuthenticated: checkAuthenticated
}
