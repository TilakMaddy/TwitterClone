const express = require('express')
const router = express.Router()
const User = require('../schemas/UserSchema')

router.get('/', (req, res, next) => {

  res.status(200)
    .render("register");

})

router.post('/', async (req, res, next) => {

  const { password } = req.body;

  // we dont want the spaces from our passwords to be trimmed !
  Object.keys(req.body).map(function(key) {
    req.body[key]=req.body[key].trim();
  });

  const { firstName, lastName, username, email } = req.body;
  var payload = req.body;

  if(firstName && lastName && username && email && password) {

    // checking is the user is new
    const existingUser = await User.findOne({

      $or: [
        { username },
        { email }
      ]

    })
    .catch(e => {

      console.log(e)

      payload.errorMessage = "Something went wrong !"

      res.status(200)
        .render("register", payload);

    })

    if(existingUser) {

      if(email == existingUser.email) {
        payload.errorMessage = "Email already in use !"
      } else {
        payload.errorMessage = "Username already in use !"
      }

      res.status(200)
        .render("register", payload);

    } else {

      // New user -> ok ! Go and register !!!



    }

  } else {

    payload.errorMessage = "Make Sure each field has a valid value."

    res.status(200)
      .render("register", payload);

  }


})

module.exports = router;



