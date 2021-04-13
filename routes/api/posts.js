const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')

router.get("/", async (req, res, next) => {

  var posts = await Post.find()
    .populate("postedBy")
    .sort({"createdAt": -1})
    .catch(e =>  {console.log(e);res.sendStatus(400) })

  res.status(200).send(posts)

});

router.post('/', async (req, res, next) => {

  if(!req.body.content) {
    console.log("No data received to posts api");
    return res.sendStatus(400)
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user
  }

  var newPost = await Post.create(postData)
    .catch(err => {
      console.log("post creation failed");
      res.sendStatus(400)
    })


  newPost = await User.populate(newPost, { path: "postedBy" })

  // 201 => code for succesfully created resource
  res.status(201).send(newPost)


})

module.exports = router;



