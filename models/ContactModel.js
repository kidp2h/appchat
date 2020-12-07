const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ContactSchema = new Schema({
    userId: String,
    // username : String,
    contactId: String,
    // usernameContact : String,
    status: {
        type: Boolean,
        default: false
    }
})

ContactSchema.statics = {
    findAllContactOfId(userId) {
        return this.find({
                $or : [{userId:userId},{contactId:userId}]

        }).sort().exec();
    },
    addContact(userId, contactId) {
        return this.create({
            userId: userId,
            contactId: contactId
        })
    },
    findContactWaitAccept(userId){
        return this.find({
            $and : [{contactId:userId},{status:false}]
        }).limit(10)
    },
    findContactIsFriend(userId){
        return this.find({
            $or :[{userId : userId},{contactId : userId}],
            status:true
        })
    },
    updateStatusFriend(userId,contactId){
        let filter = {
            userId : contactId,
            contactId:userId
        }
        let update = {
            status : true
        }
        return this.findOneAndUpdate(filter,update)
    },
    getCountFriend(userId){
        return this.find({
            $or :[{userId : userId},{contactId:userId}],
            status:true
        })
    },
    checkStatus(userId,contactId){
        return this.find({
            userId:userId,
            contactId:contactId
        })
    },
    acceptRequest(userId,contactId){
        return this.findOneAndUpdate({userId:contactId,contactId:userId,status:false},{status:true});
    }
}

module.exports = Mongoose.model('contacts', ContactSchema)
