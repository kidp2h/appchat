const ControllerUser = require('../controllers/ControllerUser');
const ControllerContact = require('../controllers/ControllerContact');

let MainApp = async (req,res) => {
    let user = req.session.passport.user
    let infoUser = await ControllerUser.getInfoUserById(user._id);
    let allContactToAdd = await ControllerContact.getAllContactsToAdd(user._id)
    let allContactWaitAccept = await ControllerContact.getAllContactWaitAccept(user._id)
    let allContactIsFriend = await ControllerContact.getAllContactIsFriend(user._id)
    let countFriend = await ControllerContact.getCountFriend(user._id);
    res.render("index",{
        userRecord:infoUser,
        allContactToAdd:allContactToAdd,
        allContactWaitAccept:allContactWaitAccept,
        allContactIsFriend:allContactIsFriend,
        countFriend:countFriend
    })
}

module.exports = {
    MainApp : MainApp
}
