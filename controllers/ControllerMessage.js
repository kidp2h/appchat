const MessageModel = require("../models/MessageModel");
const date = require("date-and-time");
const emoji = require("node-emoji");

let getConversation = async (req,res) => {
    let userId = req.params.userId;
    let contactId = req.params.contactId;
    let avatarContact = req.body.avatar
    let result = await MessageModel.getMessages(userId, contactId);
    let contentBox =``;
    if(result){
        result.forEach(collections => {
            if(collections.type == "text"){
                let time = new Date(collections.sendAt)
                let resultFinal = date.format(time,'DD/MM/YYYY HH:mm:ss');
                if(userId == collections.senderId){
                    contentBox +=
                    `<div class="message me">
                        <div class="text-main">
                            <div class="text-group me">
                                <div class="text me">
                                    <p>${emoji.emojify(collections.message)}</p>
                                </div>
                            </div>
                            <span>${resultFinal}</span>
                        </div>
                    </div>`
                }
                else{
                    contentBox +=
                    `<div class="message">
                       <img class="avatar-md" src="${avatarContact}"
                           data-toggle="tooltip" data-placement="top" alt="avatar">
                       <div class="text-main">
                           <div class="text-group">
                               <div class="text">
                                  <p>${emoji.emojify(collections.message)}</p>
                               </div>
                           </div>
                           <span>${resultFinal}</span>
                       </div>
                    </div>`
                }
            }else{
                let time = new Date(collections.sendAt)
                let resultFinal = date.format(time,'DD/MM/YYYY HH:mm:ss');
                if(userId == collections.senderId){
                    contentBox +=
                    `<div class="message me">
                        <div class="text-main">
                            <div class="text-group me">
                                <div class="text me img_cont_msg">
                                    <img src="${collections.message}" style="width:350px">
                                </div>
                            </div>
                            <span>${resultFinal}</span>
                        </div>
                    </div>`
                }
                else{
                    contentBox +=
                    `<div class="message">
                       <img class="avatar-md" src="${avatarContact}"
                           data-toggle="tooltip" data-placement="top" alt="avatar">
                       <div class="text-main">
                           <div class="text-group">
                               <div class="text img_cont_msg">
                                  <img src="${collections.message}" style="width:350px">
                               </div>
                           </div>
                           <span>${resultFinal}</span>
                       </div>
                    </div>`
                }
            }

        });
    }else{
        res.json("");
    }
//console.log(contentBox);
    res.json(contentBox);
}

let sendMessage = async (req,res) => {
    let senderId = req.body.senderId;
    let receiverId = req.body.currentUserFriend.contactId;
    let message = req.body.message

    let result = await MessageModel.sendMessage(senderId, receiverId, message)
    if(result){
        res.json({"status":true,"message":emoji.emojify(message)});
    }
}

let sendPicture = async (req,res) => {
    let senderId = req.params.senderId;
    let receiverId = req.params.receiverId;
    let infoFile = req.file
    if (infoFile.mimetype == "image/jpeg" || infoFile.mimetype == "image/png" || infoFile.mimetype == "image/jpg") {
        let srcAvatar = `/images/avatars/${infoFile.filename}`

        let result = await MessageModel.sendImage(senderId, receiverId, srcAvatar)

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

let test = async (req,res) => {
    await MessageModel.updateAll();
}

module.exports = {
    getConversation : getConversation,
    sendMessage : sendMessage,
    sendPicture: sendPicture,
    test:test
}
