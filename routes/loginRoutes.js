const express = require('express')
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')

router.get('/', (req, res, next) => {

  res.status(200)
    .render("login");

})

router.post('/', async (req, res, next) => {

  var payload = req.body

  if(req.body.logUsername && req.body.logPassword) {

    const user = await User.findOne({

      $or: [
        { username: req.body.logUsername },
        { email: req.body.logUsername }
      ]

    })
    .catch(e => {

      console.log(e)

      payload.errorMessage = "Something went wrong !"

      return res.status(200)
        .render("login", payload);

    })


    if(user != null) {

      const passwordMatches = await bcrypt.compare(req.body.logPassword, user.password)

      if(passwordMatches === true) {
        req.session.user = user
        return res.redirect('/')

      }

    }

  }

  payload.errorMessage = "Login credentials incorrect !"

  res.status(200)
    .render("login", payload);

})

module.exports = router;



