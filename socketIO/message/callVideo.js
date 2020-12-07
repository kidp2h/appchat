const {emitDataToUser} = require("../../helpers/socketIO");
const generalSocket = require("../generalSocket");
//const emoji = require("node-emoji")
let callVideo = (io) => {
    let clients = {};

    io.on("connection",(socket) => {
        generalSocket(clients,socket);

        socket.on("client_checkContactIsOnline",data => {
            if(clients[data.listener.contactId] == undefined){
                //offline
                socket.emit("server_contactIsOffline")
            }else{
                let res = {
                    caller : data.caller,
                    listener : data.listener
                }
                //online
                emitDataToUser(socket,"server_requestPeerId",clients,data.listener.contactId,res)
            }
        })

        socket.on("client_returnPeerId",data => {
            if(clients[data.caller._id]){
                emitDataToUser(socket,"server_returnPeerId",clients,data.caller._id,data)
            }
            //console.log(data);
        })
        socket.on("client_calling",data => {
            //console.log(data);
            if(clients[data.listener.contactId]){
                emitDataToUser(socket,"server_callingToListener",clients,data.listener.contactId,data)
            }
        })

        socket.on("client_callerCancelCall",data => {
            //console.log(data);
            if(clients[data.listener.contactId]){
                emitDataToUser(socket,"server_callerCancelCall",clients,data.listener.contactId,data)
            }
        })
        socket.on("client_listenerCancelCall",data => {
            if(clients[data.caller._id]){
                emitDataToUser(socket,"server_listenerCancelCall",clients,data.caller._id,data)
            }
        })

        socket.on("client_listenerAcceptCall",data => {
            if(clients[data.caller._id]){
                emitDataToUser(socket,"server_listenerAcceptCall_toCaller",clients,data.caller._id,data)
            }
            if(clients[data.listener.contactId]){
                socket.emit("server_listenerAcceptCall_toListener",data)
            }
        })

        socket.on("client_callerEndCall",data => {
            if(clients[data.listener.contactId]){
                emitDataToUser(socket,"server_callerEndCall_toListener",clients,data.listener.contactId,data)
            }
        })

        socket.on("client_listenerEndCall",data => {
            if(clients[data.caller._id]){
                emitDataToUser(socket,"server_listnerEndCall_toCaller",clients,data.caller._id,data)
            }
        })

    })
}

module.exports = {
    callVideo : callVideo
}
