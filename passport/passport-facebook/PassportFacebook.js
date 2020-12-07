const passport = require('passport');
const PassportFacebook = require('passport-facebook');
const UserModel = require('../../models/UserModel');
require('dotenv').config();

let FacebookStrategy = PassportFacebook.Strategy;

let initPassportFacebook = () => {  
    passport.use(new FacebookStrategy({
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL:process.env.CALLBACK_URL_FB,
        passReqToCallback: true,
        profileFields:["email","gender","displayName","picture"]
    },async (req, accessToken, refreshToken, profile, done) => {
        let user = await UserModel.findUserByIdFB(profile.id);
        if(user){
            //console.log(user);
            return done(null,user,{message:"success"})
            
        }else{

            let username = profile.emails[0].value;
                username = username.match(/[^@]+/g);
            let newUser = {
                username:username[0],
                gender:profile.gender,
                avatar:profile.photos[0].value,
                facebook :{
                    uid :profile.id
                }
            }
            let result = await UserModel.createNewUserFB(newUser)
            console.log(result)
            return done(null,result,{message:"success"})
        }
    }))

    
passport.serializeUser((user,done) =>{
    done(null,user._id)
})

passport.deserializeUser((id,done) => {
    UserModel.findUserById(id)
        .then(user => {
            return done(null,user);
        })
        .catch(error => {
            return(error,null)
        })
})
}

module.exports = initPassportFacebook