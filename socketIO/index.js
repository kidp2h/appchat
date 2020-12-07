const {addFriend} = require("./contact/addFriends");
const {sendMessage} = require("./message/sendMessage");
const {callVideo} = require("./message/callVideo")
let initSocketIO = (io) => {

    addFriend(io);
    sendMessage(io);
    callVideo(io);

}

module.exports = initSocketIO;
