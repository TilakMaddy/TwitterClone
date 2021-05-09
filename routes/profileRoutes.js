const express = require('express');
const User = require('../schemas/UserSchema');
const router = express.Router()

router.get('/', (req, res, next) => {

  var payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user
  }

  res.status(200)
    .render("profilePage", payload);

})


router.get('/:uname', async (req, res, next) => {

  // uname can be username or id => both will be resolved

  var payload = await getPayload(req.params.uname, req.session.user)

  res.status(200)
    .render("profilePage", payload);

})


router.get('/:uname/replies', async (req, res, next) => {

  // uname can be username or id => both will be resolved

  var payload = await getPayload(req.params.uname, req.session.user)
  payload.selectedTab = "replies";

  res.status(200)
    .render("profilePage", payload);

})


async function getPayload(username, userLoggedIn) {

  var user = (await User.findOne({ username }) ) ||
     (await User.findById(username))

  if(!user) return {
    pageTitle: "User not found ",
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
  };


  return {
    pageTitle: user.username,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user
  };

}

module.exports = router;