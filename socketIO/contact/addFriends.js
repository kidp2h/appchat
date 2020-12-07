const {emitDataToUser} = require("../../helpers/socketIO");
const generalSocket = require("../generalSocket");
let addFriend = (io) => {
    let clients = {}
    io.on("connection",(socket) => {

        generalSocket(clients,socket);
        socket.on("client_addFriend", (contactId) => {
            emitDataToUser(socket,"server_addFriend", clients, contactId, socket.request.user)
        })
        socket.on("client_acceptRequest",(data) => {
            emitDataToUser(socket,"server_acceptRequest", clients, data.contactId, data)
        })
    })

}

module.exports = {
    addFriend : addFriend
}
