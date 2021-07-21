const express = require('express');
const router = express.Router()

var Message = require('../../schemas/MessageSchema');
const User = require('../../schemas/UserSchema');
const Notification = require('../../schemas/NotificationSchema');

router.get("/", async (req, res, next) => {

  var searchObj = { userTo: req.session.user._id, notificationType: { $ne: "message"} };

  if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
    searchObj.opened = false;
  }

  Notification
  .find(searchObj)
  .populate("userTo")
  .populate("userFrom")
  .sort({createdAt: -1})
  .then(result => {
    res.status(200).send(result)
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(400);
  });

});


router.get("/latest", async (req, res, next) => {

  Notification
  .findOne({ userTo: req.session.user._id })
  .populate("userTo")
  .populate("userFrom")
  .sort({createdAt: -1})
  .then(result => {
    res.status(200).send(result)
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(400);
  });

});

router.put("/:id/markAsOpened", async (req, res, next) => {

  Notification
  .findByIdAndUpdate(req.params.id, { opened: true })

  .then(_ => {

    res.sendStatus(204);
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(400);
  });

});

router.put("/markAsOpened", async (req, res, next) => {

  Notification
  .updateMany({ userTo: req.session.user._id }, {opened: true})
  .then(_ => {

    res.sendStatus(204);
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(400);
  });

});

module.exports = router;