const express = require('express')
const router = express.Router()


router.get('/', (req, res, next) => {

  res.status(200)
    .render("register");

})

router.post('/', (req, res, next) => {

  const { password } = req.body;

  // we dont want the spaces from our passwords to be trimmed !
  Object.keys(req.body).map(function(key) {
    req.body[key]=req.body[key].trim();
  });

  const { firstName, lastName, username, email } = req.body;
  var payload = req.body;

  if(firstName && lastName && username && email && password) {

    // res.status(200).

  } else {

    payload.errorMessage = "Make Sure each field has a valid value."

    res.status(200)
      .render("register", payload);

  }


})

module.exports = router;



