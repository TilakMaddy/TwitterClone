$('#postTextarea, #replyTextarea').on('keyup', e => {
  var textbox = $(e.target)
  var val = textbox.val().trim()

  var isModal = textbox.parents(".modal").length === 1;

  var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if(val == "") {
    submitButton.prop('disabled', true)
    return;
  }

  submitButton.prop('disabled', false)
})

$('#submitPostButton, #submitReplyButton').on('click', e => {

  var button = $(e.target)
  var isModal = button.parents(".modal").length === 1;
  var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");


  var data = {
    content: textbox.val()
  }

  if(isModal) {
    var id = button.data().id;

    if(id == null)
      return alert("Button has null id !")

    data.replyTo = id;

  }


  $.post("/api/posts", data, (postData, status, xhr) => {

    if(postData.replyTo) {
      location.reload()
      return;
    }

    var html = createPostHtml(postData)
    $(".postsContainer").prepend(html)
    textbox.val("");
    button.prop('disabled', true)

  })

})

$("#replyModal").on("show.bs.modal", (e) => {
  var button = $(e.relatedTarget);
  var postId = getPostIdFromElement(button);


  $("#submitReplyButton").attr("data-id", postId)


  $.get(`/api/posts/${postId}`, result => {
    outputPosts(result.postData, $("#originalPostContainer"))
  })

})

$("#replyModal")
  .on("hidden.bs.modal", () => $("#originalPostContainer").html(""))


$("#deletePostModal").on("show.bs.modal", (e) => {
  var button = $(e.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#deletePostButton").attr("data-id", postId)
})

$("#deletePostButton").click((e) => {
  var id = $(e.target).data("id")

  $.ajax({
    url: `/api/posts/${id}`,
    type: "delete",
    success: (data, status, xhr) => {
      location.reload()
    }
  })

})

$(document).on('click', '.likeButton', e => {

  var button = $(e.target);
  var postId = getPostIdFromElement(button);

  if(undefined === postId)
    return alert("post id undefined !");

  // console.log("Liking post with id", postId);

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "put",
    success: (postData) => {

      button.find('span').text(postData.likes.length || "");

      if(postData.likes.includes(userLoggedIn._id)) {
        button.addClass('active')
      } else {
        button.removeClass('active')
      }

    }
  })

});


$(document).on('click', '.retweet', e => {

  var button = $(e.target);
  var postId = getPostIdFromElement(button);

  if(undefined === postId)
    return alert("post id undefined !");

  // console.log("Liking post with id", postId);

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "post",
    success: (postData) => {


      button.find('span').text(postData.retweetUsers.length || "");

      if(postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass('active')
      } else {
        button.removeClass('active')
      }

    }
  })

});

$(document).on('click', '.post', e => {

  var element = $(e.target);
  var postId = getPostIdFromElement(element);

  if(postId !== undefined && !element.is("button")) {
    window.location.href = '/posts/' + postId;
  }

})

$(document).on('click', '.followButton', e => {

  var button = $(e.target);
  var userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "put",
    success: (data, status, xhr) => {

      console.log(data)

      if(xhr.status == 404) {
        return alert('user not found !');
      }

      var difference = 1;

      if(data.following && data.following.includes(userId)) {
        button.addClass("following")
        button.text("Following")
      }
      else {
        button.removeClass("following")
        button.text("Follow")
        difference = -1;
      }

      var followersLabel = $("#followersValue")

      if(followersLabel.length != 0) {
        var followersText = parseInt(followersLabel.text())
        followersLabel.text(followersText + difference)
      }

    }
  })


})


function getPostIdFromElement(element) {
  var isRoot = element.hasClass('post')
  var rootElement = isRoot ? element : element.closest('.post');
  return rootElement.data().id;
}

function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
       return Math.round(elapsed/1000) + ' seconds ago';
  }

  else if (elapsed < msPerHour) {
       return Math.round(elapsed/msPerMinute) + ' minutes ago';
  }

  else if (elapsed < msPerDay ) {
       return Math.round(elapsed/msPerHour ) + ' hours ago';
  }

  else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + ' days ago';
  }

  else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + ' months ago';
  }

  else {
      return Math.round(elapsed/msPerYear ) + ' years ago';
  }
}

function outputPosts(results, container) {
  container.html("")

  if(!Array.isArray(results)) {
    results = [results]
  }

  results.forEach(r => {
    var html = createPostHtml(r)
    container.append(html)
  });

  if(results.length === 0) {
    container.append("<span class='noresults'> Nothing to show <span>")
  }
}


function createPostHtml(postData, largeFont = false) {

  var isRetweet = postData.retweetData !== undefined;
  var retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  if(!postData)
    return console.log("postData is null");

  var postedBy = postData.postedBy;

  if(postedBy._id === undefined) {
    return console.log('user object not populated');
  }

  var displayName = postedBy.firstName + " " + postedBy.lastName;
  var timestamp = timeDifference(new Date(), new Date(postData.createdAt))

  var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active': "";
  var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? 'active': "";

  var retweetText = "";
  if(isRetweet) {
    retweetText = `
    <span>  <i class="fas fa-retweet"> </i>
    Retweeted by <a href="/profile/${retweetedBy}">@${retweetedBy}</a> </span>
    `;
  }

  var replyFlag = "";

  if(postData.replyTo && postData.replyTo._id) {


    var replyToUsername = postData.replyTo.postedBy.username
    replyFlag = `<div class='replyFlag'>
      Replying to <a href='/profile/${replyToUsername }'>@${replyToUsername}</a>
    </div>`

  }

  var buttons = "";

  if(postData.postedBy. _id == userLoggedIn._id) {
    buttons = `
      <button data-id='${postData._id}' data-toggle='modal' data-target='#deletePostModal'>
        <i class='fas fa-times'> </i>
      </button>
    `;
  }

  return `
    <div class="post" data-id="${postData._id}">
      <div class="postActionContainer">
          ${retweetText}
      </div>
      <div class='mainContentContainer'>
        <div class='userImageContainer'>
          <img src='${postedBy.profilePic}'/>
        </div>
        <div class='postContentContainer'>
          <div class='header'>
            <a href="/profile/${postedBy.username}" class="displayName">
              ${displayName}
            </a>
            <span class="username">@${postedBy.username}</span>
            <span class="date">${timestamp}</span>
            ${buttons}
          </div>
          ${replyFlag}
          <div class='postBody'>
            <span> ${postData.content} </span>
          </div>
          <div class='postFooter'>
            <div class="postButtonContainer">
              <button data-toggle='modal' data-target='#replyModal '>
                <i class="far fa-comment"> </i>
              </button>
            </div>
            <div class="postButtonContainer green">
              <button class='retweet ${retweetButtonActiveClass}'>
                <i class="fas fa-retweet"> </i>
                <span> ${postData.retweetUsers.length || ""} </span>
              </button>
            </div>
            <div class="postButtonContainer red">
              <button class='likeButton ${likeButtonActiveClass}'>
                <i class="far fa-heart"> </i>
                <span> ${postData.likes.length || ""} </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}


function outputPostsWithReplies(results, container) {
  container.html("")

  if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
    var html = createPostHtml(results.replyTo)
    container.append(html)

  }

  var html = createPostHtml(results.postData, true)
  container.append(html)


  results.replies.forEach(r => {
    var html = createPostHtml(r)
    container.append(html)
  });


}