$(document).ready(() => {

  // if we are replies tab, load replies
  // if we are on posts tab, load posst

  if(selectedTab === "replies") {
    loadReplies();
  } else {
    loadPosts();
  }

})

function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}


function loadReplies() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}
