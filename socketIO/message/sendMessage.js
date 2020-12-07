const {emitDataToUser} = require("../../helpers/socketIO");
const generalSocket = require("../generalSocket");
const date = require("date-and-time");
//const emoji = require("node-emoji")
let sendMessage = (io) => {
    let clients = {};
    io.on("connection",(socket) => {
        generalSocket(clients,socket);
        socket.on("client_sendMessage",(data) => {
            data.time = date.format(new Date(Date.now()),'DD/MM/YYYY HH:mm:ss')
            emitDataToUser(socket,"server_sendMessage",clients,data.currentUserFriend.contactId,data);
        })
        socket.on("client_sendImage",(data) => {
            data.time = date.format(new Date(Date.now()),'DD/MM/YYYY HH:mm:ss')
            emitDataToUser(socket,"server_sendImage",clients,data.currentUserFriend.contactId,data);
        })
        socket.on("client_typing",data => {
            emitDataToUser(socket,"server_typing",clients,data.contactId,data);
        })
    })
}

module.exports = {
    sendMessage : sendMessage
}
