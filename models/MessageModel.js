const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const MessageSchema = new Schema({

    senderId: String,
    receiverId: String,
    message: String,
    type:String,
    sendAt: {
        type: Number,
        default: Date.now()
    }
})

MessageSchema.statics = {

    getMessages(userId, contactId) {
        return this.find({
            $or : [
                {$and : [{senderId : userId},{receiverId:contactId}]},
                {$and : [{senderId : contactId},{receiverId:userId}]}
            ]
        })
    },
    sendMessage(senderId,receiverId,message){
        return this.create({
            senderId : senderId,
            receiverId : receiverId,
            message : message,
            type:"text"
        })
    },
    sendImage(senderId,receiverId,message){
        return this.create({
            senderId : senderId,
            receiverId : receiverId,
            message : message,
            type:"image"
        })
    },
    updateAll(){
        return this.update({},{type:"text"},{multi:true})
    }

}



module.exports = Mongoose.model("messages", MessageSchema);
