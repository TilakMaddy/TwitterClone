const express = require('express')
const router = express.Router()

router.get('/:id', (req, res, next) => {

  var payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.postId
  }

  res.status(200)
    .render("postPage", payload);

})

module.exports = router;



