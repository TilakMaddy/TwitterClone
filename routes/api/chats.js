const express = require('express')
const router = express.Router()

var Chat = require('../../schemas/ChatSchema');

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
  .then(results => res.status(200).send(results))
  .catch(error => {
    console.log(error);
    res.sendStatus(400);
  })
});

module.exports = router;




