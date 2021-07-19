$(document).ready(() => {
  $.get("/api/chats", (data, status, xhr) => {

    if(xhr.status == 400) {
      return alert("Could not get chat list !");
    }

    outputChatResults(data, $(".resultsContainer"));

  })
});

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

  return `
    <a class='resultListItem' href='/messages/${chat._id}'>
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