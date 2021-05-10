const express = require('express');
const User = require('../schemas/UserSchema');
const router = express.Router()

router.get('/', (req, res, next) => {

  var payload = createPayload(req);

  res.status(200)
    .render("searchPage", payload);

})

router.get('/:selectedTab', (req, res, next) => {

  var payload = createPayload(req);
  payload.selectedTab = req.params.selectedTab;

  res.status(200)
    .render("searchPage", payload);

})

function createPayload(req) {
  return {
    pageTitle: "Search",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  }
}

module.exports = router;