const express = require('express');
const ChatSchema = require('../../schemas/ChatSchema');
const router = express.Router()

var Message = require('../../schemas/MessageSchema');
const User = require('../../schemas/UserSchema');

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

    ChatSchema.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message
    })
    .catch(console.log);

    res.status(201).send(message)
  })
  .catch(error => {
    console.log(error)
    res.sendStatus(400);
  })

});


module.exports = router;