const express = require('express');
const ChatSchema = require('../../schemas/ChatSchema');
const router = express.Router()

var Message = require('../../schemas/MessageSchema');
const User = require('../../schemas/UserSchema');
const Notification = require('../../schemas/NotificationSchema');

router.post("/", async (req, res, next) => {

  if(!req.body.content || !req.body.chatId) {
    console.log("invalid data passed to request")
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId
  }

  Message.create(newMessage)
  .then(async (message) => {

    message = await message.populate("sender").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, { path: "chat.users"});

    var chat = await ChatSchema.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message
    })
    .catch(console.log);

    insertNotif(chat, message);

    res.status(201).send(message)
  })
  .catch(error => {
    console.log(error)
    res.sendStatus(400);
  })

});


function insertNotif(chat, message) {

  chat.users.forEach(userId => {

    if(userId == message.sender._id.toString())
      return;


    Notification.insertNotification(userId, message.sender._id, "message", message.chat._id);

  });

}

module.exports = router;