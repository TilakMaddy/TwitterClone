var cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
  refreshMessagesBadge();
  refreshNotificationsBadge();
});

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
      emitNotification(postData.replyTo.postedBy)
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

$("#confirmPinModal").on("show.bs.modal", (e) => {
  var button = $(e.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#pinPostButton").attr("data-id", postId)
})


$("#unpinModal").on("show.bs.modal", (e) => {
  var button = $(e.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#unpinPostButton").attr("data-id", postId)
})


$("#pinPostButton").click((e) => {
  var id = $(e.target).data("id")

  $.ajax({
    url: `/api/posts/${id}`,
    type: "put",
    data: { pinned: true },
    success: (data, status, xhr) => {
      location.reload()
    }
  })

})


$("#unpinPostButton").click((e) => {
  var id = $(e.target).data("id")

  $.ajax({
    url: `/api/posts/${id}`,
    type: "put",
    data: { pinned: false },
    success: (data, status, xhr) => {
      location.reload()
    }
  })

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

$("#filePhoto").change(e => {

  var [input] = $(e.target)

  if(input.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {

      var image = document.getElementById("imagePreview");
      image['src'] = e.target.result;

      if(cropper !== undefined) {
        cropper.destroy()
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false
      })
    }
    reader.readAsDataURL(input.files[0]);
  }

})

$("#imageUploadButton").click(() => {

  var canvas = cropper.getCroppedCanvas();

  if(canvas == null) {
    alert("couldnt upload image !")
    return;
  }

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append("croppedImage", blob)

    $.ajax({
      url: "/api/users/profilePicture",
      type: "post",
      data: formData,
      processData: false, // prevents jquery from converting data to string
      contentType: false, // no content-type header added, boundary string

      success: () => {
        location.reload();
      }
    })

  })

})

$("#coverPhotoButton").click(() => {

  var canvas = cropper.getCroppedCanvas();

  if(canvas == null) {
    alert("couldnt upload image !")
    return;
  }

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append("croppedImage", blob)

    $.ajax({
      url: "/api/users/coverPicture",
      type: "post",
      data: formData,
      processData: false, // prevents jquery from converting data to string
      contentType: false, // no content-type header added, boundary string

      success: () => {
        location.reload();
      }
    })

  })

})


$("#coverPhoto").change(e => {

  var [input] = $(e.target)

  if(input.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {

      var image = document.getElementById("coverPreview");
      image['src'] = e.target.result;

      if(cropper !== undefined) {
        cropper.destroy()
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9 ,
        background: false
      })
    }
    reader.readAsDataURL(input.files[0]);
  }

})


$("#userSearchTextbox").keydown((e) => {
  clearTimeout(timer)

  var textbox = $(e.target);
  var value = textbox.val()

  // keycode = 8 for delete button (backspace in windows)
  if(value == "" && e.which == 8) {
    // remove the last selected user
    selectedUsers.pop();
    updateSelectedUsersHtml();

    $(".resultsContainer").html("");
    if(selectedUsers.length == 0) {
      $("#createChatButton").prop("disabled", true);
    }
    return;
  }

  timer = setTimeout(() => {
    value = textbox.val().trim()

    if(value == "") {
      $(".resultsContainer").html("")

    } else {
      searchUsers(value)

    }
  }, 1000)


})

$("#createChatButton").click(() => {
  var data = JSON.stringify(selectedUsers);
  $.post("/api/chats", { users: data}, chat => {
    if(!chat || !chat._id) {
      return alert('Invalid response froms server');
    }
    window.location.href = `/messages/${chat._id}`;
  });
});

function getChatName(chatData) {
  var chatName = chatData.chatName;

  if(!chatName) {
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var namesArray = otherChatUsers.map(u => u.firstName + " " + u.lastName)
    chatName = namesArray.join(", ");
  }

  return chatName;
}

function getOtherChatUsers(users) {

  if(users.length == 1) return users;

  return users.filter(u => u._id != userLoggedIn._id);
}
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
        emitNotification(postData.postedBy);
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
        emitNotification(postData.postedBy);
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

        emitNotification(userId);

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

function outputPinnedPost(results, container) {

  if(results.length === 0) {
    container.hide();
    return;
  }

  container.html("")

  results.forEach(r => {
    var html = createPostHtml(r)
    container.append(html)
  });


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
  var pinnedPostText = "";

  if(postData.postedBy._id == userLoggedIn._id) {

    var pinnedClass = "";
    var dataTarget = "#confirmPinModal";

    if(postData.pinned === true) {
      pinnedClass = "active";
      dataTarget = "#unpinModal"
      pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned Post</span>";
    }

    buttons = `
      <button class='pinButton ${pinnedClass}' data-id='${postData._id}' data-toggle='modal' data-target='${dataTarget}'>
        <i class='fas fa-thumbtack'> </i>
      </button>

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
          <div class='pinnedPostText'>
            ${pinnedPostText}
          </div>
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



function outputUsers(results, container) {
  container.html("");

  results.forEach(result => {
    var html = createUserHtml(result, true)
    container.append(html)
  })

  if(results.length == 0) {
    container.append("<span class='noResults'> No results found </span>")
  }

}


function createUserHtml(userData, showFollowButton) {

  var name = userData.firstName + " " + userData.lastName;
  var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  var text = isFollowing ? "Following" : "Follow"
  var buttonClass = isFollowing ? "followButton following" : "followButton"

  var followButton = "";

  if(showFollowButton && (userLoggedIn._id != userData._id)) {
    followButton = `
       <div class='followButtonContainer'>
          <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
       </div>
    `;
  }

  return `
    <div class="user">
      <div class="userImageContainer">
        <img src='${userData.profilePic}' />
      </div>
      <div class='userDetailsContainer'>
        <div class='header'>
          <a href='/profile/${userData.username}'> ${name} </a>
          <span class='username'> @${userData.username} </span>
        </div>
      </div>
      ${followButton }
    </div>
  `;
}

function searchUsers(term) {
  $.get("/api/users", { search: term }, results => {
    outputSelectableUsers(results, $(".resultsContainer"))
  });
}


function outputSelectableUsers(results, container) {
  container.html("");

  results.forEach(result => {

    if(
        result._id == userLoggedIn._id ||
        selectedUsers.some(u => u._id == result._id)
      ) {
      return;
    }

    var html = createUserHtml(result, false)
    var element = $(html)

    element.click(() => userSelected(result));

    container.append(element)
  })

  if(results.length == 0) {
    container.append("<span class='noResults'> No results found </span>")
  }

}

function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
  var elements = [];

  selectedUsers.forEach(u => {
    var name = u.firstName + ' ' + u.lastName;
    var userElement = $(`
      <span class='selectedUser'> ${name} </span>
    `)
    elements.push(userElement);
  });

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}


function messageReceived(newMessage) {

  if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
    // we are not in the chat page
    // show popup notification

    showMessagePopup(newMessage);

  } else {
    // we are in the chat page
    addChatMessageHtml(newMessage);
  }

  refreshMessagesBadge();
}

function markNotificationsAsOpened(id = null,  callback = window.location.reload) {

  var url = id != null ? '/api/notifications/'+id+'/markAsOpened'
                       : '/api/notifications/markAsOpened';


  console.log(url + " put");
  $.ajax({
    url,
    type: "PUT",
    success: callback
  });

}

$(document).on("click", ".notification.active", (e) => {


  var container = $(e.target);
  var notificationId = container.data().id;

  var href = container.attr("href");
  e.preventDefault();

  var callback = () => window.location = href;

  markNotificationsAsOpened(notificationId, callback);

});


function refreshMessagesBadge() {
  $.get("/api/chats", { unreadOnly: true }, data => {

    var numResults = data.length;

    if(numResults > 0) {
      $("#mbadge").text(numResults).addClass("active");
    } else {
      $("#mbadge").text("").removeClass("active");
    }

  });
}


function refreshNotificationsBadge() {
  $.get("/api/notifications", { unreadOnly: true }, data => {

    var numResults = data.length;

    if(numResults > 0) {
      $("#nbadge").text(numResults).addClass("active");
    } else {
      $("#nbadge").text("").removeClass("active");
    }

  });
}

function showNotificationPopup(data) {
  var html = createNotificationHtml(data);
  var elem = $(html);
  elem.hide().prependTo("#notificationList").slideDown("fast");

  setTimeout(() => elem.fadeOut(400), 5000);
}

function showMessagePopup(data) {

  if(!data.chat.latestMessage._id) {
    data.chat.latestMessage = data;
  }

  var html = createChatHtml(data.chat);
  var elem = $(html);
  elem.hide().prependTo("#notificationList").slideDown("fast");

  setTimeout(() => elem.fadeOut(400), 5000);
}

function outputNotificationList(notifications, container) {

  notifications.forEach(n => {
    var html = createNotificationHtml(n);
    container.append(html);
  });

  if(notifications.length == 0) {
    container.append("<span class='noResults'> No notifications to show !</span>")
  }

}

function createNotificationHtml(notif) {

  var userFrom = notif.userFrom;
  var text = getNotificationText(notif);
  var clsName = notif.opened ? '' : 'active';

  return `
    <a href='${getNotificationURL(notif)}' class='resultListItem notification ${clsName}' data-id='${notif._id}'>
      <div class='resultsImageContainer'>
        <img src='${userFrom.profilePic}'/>
      </div>
      <div class='resultsDetailsContainer ellipsis'>
        <span class='ellipsis'>${text}</span>
      </div>
    </a>
  `;

}

function getNotificationText(notification) {

  var userFrom = notification.userFrom;

  if(!userFrom.firstName)
    return alert('user not populated');

  var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  var text;

  switch(notification.notificationType) {

    case "retweet":
      text = `${userFromName} retweeted one of your posts`;
      break;

    case "postLike":
      text = `${userFromName} liked one of your posts`;
      break;

    case "follow":
      text = `${userFromName} followed you`;
      break;

    case "reply":
      text = `${userFromName} replied to one of your posts`;
      break;

  }

  return `<span class='ellipsis'> ${text} </span>`;

}



function getNotificationURL(notification) {

  var url = '#';
  switch(notification.notificationType) {

    case "retweet":
    case "postLike":
    case "reply":
      url = '/posts/' + notification.entityId;
      break;

    case "follow":
      url = '/profile/' + notification.entityId;
      break;

  }

  return url;

}


// from inbox js


function outputChatResults(chatList, container) {

  chatList.forEach(chat => {
    var html = createChatHtml(chat);
    container.append(html);
  });
  if(chatList.length == 0) {
    container.append("<span class='noResults'> Nothing to show !</span>")
  }
}

function createChatHtml(chat) {

  console.log(chat);

  var chatName = getChatName(chat);
  var image = getChatImageElements(chat);
  var latestMessage = getLatestMessage(chat.latestMessage);

  var activeClass = chat.latestMessage?.readBy.includes(userLoggedIn._id) ? '': 'active';

  return `
    <a class='resultListItem ${activeClass}' href='/messages/${chat._id}'>
      ${image}
      <div class='resultsDetailsContainer ellipsis'>
        <span class='heading ellipsis'>${chatName}</span>
        <span class='subText ellipsis'>${latestMessage}</span>
      </div>
    </a>
  `;
}

function getLatestMessage(latestMessage) {

  if(latestMessage != null) {
    var sender = latestMessage.sender;
    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }

  return 'New chat';

}

function getChatImageElements(chatData) {
  var otherChatUsers = getOtherChatUsers(chatData.users);

  var groupChatClass = "";
  var chatImage = getUserChatImageElement(otherChatUsers[0]);

  if(otherChatUsers.length > 1) {
    groupChatClass = 'groupChatImage';
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `
    <div class='resultsImageContainer ${groupChatClass}'>
      ${chatImage}
    </div>
  `;
}

function getUserChatImageElement(user) {
  if(!user || !user.profilePic) {
    return alert('User passed into function is invalid');
  }
  return `
    <img src='${user.profilePic}' alt='user_profile_pic' />
  `;
}