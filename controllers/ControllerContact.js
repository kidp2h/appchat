const ContactModel = require('../models/ContactModel');
const _ = require('lodash');
const UserModel = require('../models/UserModel');

let getAllContactsToAdd = async (userId) => {
  let deprecatedId = []
  // get all contacts
  let result = await ContactModel.findAllContactOfId(userId);
  // remove many contacts have been in database
  if (result != null) {
    deprecatedId.push(userId);
    result.forEach(item => {
      deprecatedId.push(item.userId)
      deprecatedId.push(item.contactId)
    });
    // get except user  in list deprecatedId
    let allContactToAdd = await UserModel.getUserExceptId(deprecatedId);
    return allContactToAdd
  } else {
    return false
  }
}

let getAllContactWaitAccept = async (userId) => {
  let listRequestWaitAccept = await ContactModel.findContactWaitAccept(userId)
  let listId = []
  if (listRequestWaitAccept != null) {
    listRequestWaitAccept.forEach(item => {
      listId.push(item.userId)
    });
    let listUserFromRequest = await UserModel.findUserFromListId(listId);
    return listUserFromRequest
  } else {
    return false
  }
}

let getAllContactIsFriend = async (userId) => {
  let listContactIsFriend = await ContactModel.findContactIsFriend(userId);
  let listId = []
  listContactIsFriend.forEach(item => {
    if (item.userId == userId) {
      listId.push(item.contactId);
    } else {
      listId.push(item.userId);
    }
  });
  let listUserIsFriend = await UserModel.findUserFromListId(listId);
  return listUserIsFriend;
}

let getCountFriend = async (userId) => {
    let result = await ContactModel.getCountFriend(userId);
    if(result){
        return result.length;
    }else{
        return 0;
    }
}

let addContact = async (req, res) => {
    let userId = req.body.userId
    let contactId = req.body.contactId
    if (userId == "" || contactId == "" || userId == null || contactId == null) {

    } else {
        // check status , false or true
        let resultCheck = await ContactModel.checkStatus(userId, contactId);
        if (resultCheck) {
          let result = await ContactModel.addContact(userId, contactId);
          if(result){
              res.json('')
          }else{
              res.json('')
          }
        }

    }
}

let acceptRequest = async (req, res) => {
    let userId = req.body.userId;
    let contactId = req.body.contactId;

    let result = await ContactModel.acceptRequest(userId, contactId);
    if(result){
        res.json({
            status:true
        })
    }else{
        res.json({
            status:false
        })
    }
}

module.exports = {
  getAllContactsToAdd: getAllContactsToAdd,
  addContact: addContact,
  getAllContactWaitAccept: getAllContactWaitAccept,
  getAllContactIsFriend: getAllContactIsFriend,
  acceptRequest: acceptRequest,
  getCountFriend: getCountFriend
}
