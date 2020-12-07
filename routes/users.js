var express = require('express');
var router = express.Router();
require('dotenv').config();

//const {bodyParser, validator, xss , axios,db, passport} = require("../routes/requireLib");
const {passport} = require("../routes/requireLib");
const {ControllerUser,ControllerContact,ControllerAuth} = require("../controllers/index");
const {RenderAuth,RenderMain} = require("../render/index");

const upload = require("../config/storageMulter").configStorage();

require('../passport/passport-local/PassportLocal')();
require("../passport/passport-facebook/PassportFacebook")();

router.post('/addContact',ControllerAuth.checkAuthenticated, ControllerContact.addContact)

router.get("/signup.p2h", ControllerAuth.checkLogin,RenderAuth.Register);

router.get("/signin.p2h", ControllerAuth.checkLogin, RenderAuth.Login);

router.get('/logout', ControllerAuth.logout);

router.post("/register",ControllerAuth.checkLogin, ControllerUser.registerAccount);

router.post("/acceptRequest", ControllerAuth.checkAuthenticated, ControllerContact.acceptRequest)

router.post("/uploadAvatar", upload.single("avatar"), ControllerUser.updateAvatar)

router.post("/updateInfo", ControllerAuth.checkAuthenticated, ControllerUser.updateInfoUser)

router.post('/login',ControllerAuth.checkLogin, ControllerAuth.checkCaptcha, passport.authenticate('local', {failureMessage: "wrong"}),  (req, res) => {
    res.json({
        success: true
    })
});

router.get("/auth/facebook",ControllerAuth.checkLogin,passport.authenticate("facebook",{
    display:"popup",
    scope:['email', 'user_photos']
}))

router.get("/auth/facebook/callback",passport.authenticate("facebook",{
    successRedirect:"/AppChat",
    failureRedirect:"/users/signup.p2h"
}))


module.exports = router;
