const {pushIdSocketToArray, removeIdSocketFromArray, emitDataToUser} = require("../helpers/socketIO.js");
let generalSocket = (clients,socket) => {
    let userId = socket.request.user._id;
    pushIdSocketToArray(clients, userId, socket.id);
    socket.on("disconnect",() => {
        removeIdSocketFromArray(clients, userId, socket.id);
    })
}

module.exports = generalSocket;
