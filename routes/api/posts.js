const express = require('express')
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema');

router.get("/", async (req, res, next) => {

  var searchObj = req.query;
  console.log(searchObj)

  if(searchObj.isReply !== undefined && searchObj.isReply === 'false') {
    searchObj.replyTo = { $exists: false }; // mongoDB operator $exists
    delete searchObj.isReply;
  }


  if(searchObj.isReply !== undefined && searchObj.isReply === 'true') {
    searchObj.replyTo = { $exists: true }; // mongoDB operator $exists
    delete searchObj.isReply;
  }


  var results = await getPosts(searchObj)
  res.status(200).send(results)

});

router.get("/:id", async (req, res, next) => {

  var id = req.params.id;

  var postData = await getPosts({ _id: id });
  [postData] = postData;

  var results = { postData }

  if(postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo
  }

  results.replies = await getPosts({ replyTo : id })

  res.status(200).send(results)

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

  if(req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
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

router.put('/:id/like', async (req, res, next) => {

  var postId = req.params.id;
  var userId = req.session.user._id;

  var isLiked = req.session.user.likes?.includes(postId);

  // mongo db variables - pull , addToSet
  // (instead of resetting the field, we add/remove one item from the likes array)
  var option = isLiked ? "$pull" : "$addToSet";


  // update like on user object
  req.session.user = await User.findByIdAndUpdate
    (userId, { [option] : { likes: postId } }, { new: true}) // return the newly updated object
  .catch(e => {
    console.log(e)
    res.sendStatus(400);
  })


  // update like on Post
  var post = await Post.findByIdAndUpdate
    (postId, { [option] : { likes: userId } }, { new: true}) // return the newly updated object
  .catch(e => {
    console.log(e)
    res.sendStatus(400);
  })


  res.status(200).send(post);

});

router.post('/:id/retweet', async (req, res, next) => {

  var postId = req.params.id;
  var userId = req.session.user._id;

  // try and delete retweet
  var deletedPost = await Post.findOneAndDelete
    ({ postedBy: userId, retweetData: postId})
  .catch(e => {
    console.log(e)
    res.sendStatus(400);
  })

  var option = deletedPost != null ? "$pull" : "$addToSet";

  var repost = deletedPost;

  if(repost == null) {
    repost = await Post.create
      ({postedBy: userId, retweetData: postId})
    .catch(e => {
      console.log(e)
      res.sendStatus(400);
    })
  }

  // update retweet on user object
  req.session.user = await User.findByIdAndUpdate
    (userId, { [option] : { retweets: repost._id } }, { new: true}) // return the newly updated object
  .catch(e => {
    console.log(e)
    res.sendStatus(400);
  })


  // update like on Post
  var post = await Post.findByIdAndUpdate
    (postId, { [option] : { retweetUsers: userId } }, { new: true}) // return the newly updated object
  .catch(e => {
    console.log(e)
    res.sendStatus(400);
  })


  res.status(200).send(post);

});

router.delete("/:id", async (req, res, next) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(e => {
      console.log(e);
      res.sendStatus(400)
    })
})

async function getPosts(filter) {

  var posts = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({"createdAt": -1})
    .catch(e => console.log(e))

  posts = await User.populate(posts, { path: "replyTo.postedBy"})


  // posts = await User.populate(posts, { path: "retweetData.replyTo.postedBy"}).catch(e => {})

  return await User.populate(posts, { path: "retweetData.postedBy" })

}

module.exports = router;



