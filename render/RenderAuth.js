require("dotenv").config();

let Login = (req,res) =>{
    res.render('sign-in', {
        siteKey: process.env.SITE_KEY //site key captcha
    })
}

let Register = (req,res) => {
    res.render("sign-up",{
        siteKey:process.env.SITE_KEY
    })
}

module.exports = {
    Login:Login,
    Register:Register
}