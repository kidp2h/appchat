const Passport = require('passport');
const StrategyLocal = require('passport-local').Strategy;
const UserModel = require('../../models/UserModel');
const bcrypt = require('bcryptjs');
const ControllerUser = require('../../controllers/ControllerUser');
var initPassportLocal = () => {
    //check account and return info of user
    Passport.use(new StrategyLocal(async(username,password,done) => {
        var userRecord = await ControllerUser.loginApp(username,password)
        if(userRecord == false){
            return done(null,false, { message: 'bad password' })
        }
            return done(null,userRecord)
    }))
    
    //save session
    Passport.serializeUser((userRecord,done) =>{
        done(null,userRecord)
    })
    
    Passport.deserializeUser(async(userRecord,done) =>{
        var result = await UserModel.findUserById(userRecord._id);
            if(result._id == userRecord._id){
                return done(null,userRecord)
            }else{
                return done(null,false)
            }
        
    })
}
module.exports = initPassportLocal
    

