const express = require('express')
const app = express()
const port = 80
const middleware = require('./middleware')
const bodyParser = require('body-parser')

const mongoose = require('./database')
const session = require('express-session')

const server = app.listen(port, () => {
  console.log("Listening on " + port);
});


app.set("view engine", "pug")
app.set("views", "views")

app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
  secret: "Weapsy",
  resave: true,
  saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes')
const registerRoute = require('./routes/registerRoutes')
const logoutRoute = require('./routes/logout')
const postRoute = require('./routes/postRoutes')
const profileRoute = require('./routes/profileRoutes')
const uploadRoute = require('./routes/uploadRoutes')
const searchRoute = require('./routes/searchRoutes')

// API routes
const postsRoute = require('./routes/api/posts')
const usersRoute = require('./routes/api/users')

app.use('/login', loginRoute)
app.use('/register', registerRoute)
app.use('/logout', logoutRoute)
app.use('/posts',  middleware.requireLogin, postRoute)
app.use('/profile',  middleware.requireLogin, profileRoute)
app.use('/uploads', uploadRoute)

app.use('/api/posts', postsRoute)
app.use('/api/users', usersRoute)
app.use('/search', middleware.requireLogin, searchRoute)


app.get('/', middleware.requireLogin , (req, res, next) => {

  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200)
    .render("home", payload);

})

module.exports = app

