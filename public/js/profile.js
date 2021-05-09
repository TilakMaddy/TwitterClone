$(document).ready(() => {

  // if we are replies tab, load replies
  // if we are on posts tab, load posst

  loadPosts();

})

function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}

