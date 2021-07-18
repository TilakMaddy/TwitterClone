const express = require('express');
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');
const mongoose = require('mongoose');
const router = express.Router()

router.get('/', (req, res, next) => {

  var payload = {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200)
    .render("inboxPage", payload);

})

router.get('/new', (req, res, next) => {

  var payload = {
    pageTitle: "New message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200)
    .render("newMessage", payload);

})

router.get('/:chatId', async (req, res, next) => {

  var user = req.session.user._id;
  var chatId = req.params.chatId;
  var isValidId = mongoose.isValidObjectId(chatId);

  var payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  }

  if(!isValidId) {
    payload.errorMessage = 'Chat doesnt exist or you do not have permission to view it';
    return res.status(200).render("chatPage", payload);
  }

  var chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: user } }}).populate("users");

  if(chat == null) {
    // check if chatId is userId
    var userFound = await User.findById(chatId);
    if(userFound != null) {
      // get chat using the user id
      chat = await getChatByUserId(userFound._id, user)
    }
  }

  if(chat == null) {
    payload.errorMessage = 'Chat doesnt exist or you do not have permission to view it';
  } else {
    payload.chat = chat;
  }

  res.status(200)
    .render("chatPage", payload);

})


function getChatByUserId(userLoggedInId, otherUserId) {
  return Chat.findOneAndUpdate({
    isGroupChat: false,
    users: {
      $size: 2,
      $all: [
        {$elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
        {$elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }}
      ]
    }
  },
  {
    $setOnInsert: {
      users: [userLoggedInId, otherUserId]
    }
  },
  {
    new: true,
    upsert: true, // if you didnt find it, create it !
  })
  .populate("users")
}

module.exports = router;
