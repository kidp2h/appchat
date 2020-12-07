const express = require("express");
const router = express.Router();
const {ControllerMessage,ControllerAuth} = require("../controllers/index")
const upload = require("../config/storageMulter").configStorage();

router.post("/getConversation/:userId/:contactId" ,ControllerMessage.getConversation);

router.post("/sendMessage", ControllerMessage.sendMessage)

router.post("/sendPicture/:senderId/:receiverId",upload.single("send_image"),ControllerMessage.sendPicture);


//router.get("/test",ControllerMessage.test)
module.exports = router;
