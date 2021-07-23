const express = require('express')
const router = express.Router()

var Chat = require('../../schemas/ChatSchema');
const MessageSchema = require('../../schemas/MessageSchema');
const User = require('../../schemas/UserSchema');

router.post("/", async (req, res, next) => {

  if(!req.body.users) {
    console.log("Users param not sent with request !");
    return res.sendStatus(400);
  }

  var users = JSON.parse(req.body.users);

  if(users.length == 0) {
    return res.sendStatus(400);
  }

  users.push(req.session.user);

  var chatData = {
    users,
    isGroupChat: true,
  }

  Chat
  .create(chatData)
  .then(result => {
    res.status(200).send(result);
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(400);
  })


});

router.get("/", async (req, res, next) => {
  Chat.find({ users: { $elemMatch: { $eq: req.session.user._id }}})
  .populate("users")
  .populate("latestMessage")

  .sort({updatedAt: -1})
  .then(async (results) => {

    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
      results = results.filter(r => {
        // return true;

        return !r.latestMessage?.readBy.includes(req.session.user._id);
      });
    }

    results = await User.populate(results, "latestMessage.sender");
    res.status(200).send(results);
  })
  .catch(error => {
    console.log(error);
    res.sendStatus(400);
  })
});

router.get("/:chatId", async (req, res, next) => {

  // we dont use findById because we wanna verify that this user is definitely a partof this chat

  Chat.findOne({_id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id }}})
  .populate("users")
  .then(results => res.status(200).send(results))
  .catch(error => {
    console.log(error);
    res.sendStatus(400);
  })

});

router.put("/:chatId", async (req, res, next) => {
  Chat.findByIdAndUpdate(req.params.chatId, req.body)
  .then(_ => res.sendStatus(204))
  .catch(error => {
    console.log(error);
    res.sendStatus(400);
  })
});


router.get("/:chatId/messages", async (req, res, next) => {

  MessageSchema.find({ chat: req.params.chatId })
  .populate("sender")
  .then(results => res.status(200).send(results))
  .catch(error => {
    console.log(error);
    res.sendStatus(400);
  })

});


router.put("/:chatId/messages/markAsRead", async (req, res, next) => {

  MessageSchema.updateMany({ chat: req.params.chatId }, {
    $addToSet: { readBy: req.session.user._id }
  })
  .then(() => res.sendStatus(204))
  .catch(error => {
    console.log(error);
    res.sendStatus(400);
  })

});


module.exports = router;




