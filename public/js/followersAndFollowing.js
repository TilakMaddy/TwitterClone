$(document).ready(() => {

  // if we are replies tab, load replies
  // if we are on posts tab, load posst

  if(selectedTab === "following") {
    loadFollowing();
  } else {
    loadFollowers();
  }

})

function loadFollowing() {
  $.get("/api/users/" + profileUserId + "/following", results => {
    outputUsers(results, $(".resultsContainer"))
  })
}


function loadFollowers() {
  $.get("/api/users/" + profileUserId + "/followers", results => {
    outputUsers(results, $(".resultsContainer"))
  })
}

function outputUsers(data, container) {
  console.log(data)
}