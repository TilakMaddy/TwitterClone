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
  var latestMessage = 'thi is latest message';

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