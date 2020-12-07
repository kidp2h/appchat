/**
 * TODO: code push id socket, emit event, remove id socket here
 */

let pushIdSocketToArray = (clients,userId,socketId) => {
    if(clients[userId])
        clients[userId].push(socketId);

    clients[userId] = [socketId]

    return clients;
}

let removeIdSocketFromArray = (clients,userId,socketId) => {
    try {
        if(clients[userId].length == 0)
            delete clients[userId];
        clients[userId] = clients[userId].filter(sId => sId != socketId)
    } catch (e) {
        console.log(e);
    }
}

let emitDataToUser = (socket,nameEvent,clients,userIdToEmit,dataToEmit) => {
        //userIdToEmit = userIdToEmit.trim();
        if(clients[userIdToEmit]){
            clients[userIdToEmit].forEach(sId => {
                socket.to(sId).emit(nameEvent,dataToEmit)
            });
        }
}

module.exports = {
    pushIdSocketToArray : pushIdSocketToArray,
    removeIdSocketFromArray:removeIdSocketFromArray,
    emitDataToUser:emitDataToUser
}
