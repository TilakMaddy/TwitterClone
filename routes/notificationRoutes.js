const express = require('express');
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');
const mongoose = require('mongoose');
const router = express.Router()

router.get('/', (req, res, next) => {

  var payload = {
    pageTitle: "Notifications",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200)
    .render("notificationsPage", payload);

})

module.exports = router;
