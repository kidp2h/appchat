const Mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require("dotenv").config();
const saltRounds = parseInt(process.env.SALT_ROUNDS)
const Schema = Mongoose.Schema;
const UserSchema = new Schema({
    username : {
        type:String,
        default:null
    },
    password : {
        type:String,
        default:null
    },
    role : {
        type : String,
        default : null
    },
    gender : {
        type: String,
        default : "female"
    },
    avatar : {
        type : String,
        default : "/images/avatars/avatardefault.png"
    },
    facebook:{
        uid : String
    }
})
UserSchema.statics = {
    registerUser(usrName,pwd){
        return this.create({
            username : usrName,
            password : bcrypt.hashSync(pwd,saltRounds)
        })
    },
    findUser(username){
        return this.findOne({
            username : username
        }).exec()
    },
    getAllUser(userId){
        return this.find({_id: { $nin: userId }})
    },
    findUserById(userId){
        return this.findOne({
            _id:userId
        }).exec()
    },
    getUserExceptId(arrUserId){
        //console.log(arrUserId);
        return this.find({
            _id: {$nin: arrUserId}
        })
    },
    findUserFromListId(listId){
        return this.find({
            _id:{$in:listId}
        })
    },
    updateAvatarUser(userId,srcAvatar){
        return this.updateMany({_id:userId},{avatar:srcAvatar});
    },
    findImageCurrent(userId){
        return this.find({_id:userId})
    },
    updateInfo(userId,info){
        if((info.password == undefined || info.currentPwd == undefined) && info.gender != undefined){
            return this.updateMany({_id:userId},{gender:info.gender})
        }else if(info.password != undefined && info.currentPwd != undefined && info.gender != undefined){
            return this.updateMany({_id:userId},{password:bcrypt.hashSync(info.password,saltRounds),gender:info.gender})
        }else{
            return this.updateMany({_id:userId},{password:bcrypt.hashSync(info.password,saltRounds)})
        }
    },
    createNewUserFB(newUser){
        return this.create(newUser);
    },
    findUserByIdFB(id){
        return this.findOne({facebook:{uid:id}}).exec();
    }
}

module.exports = Mongoose.model('users',UserSchema);
