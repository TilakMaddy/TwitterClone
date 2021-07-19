
$(document).ready(() => {

  $.get("/api/chats/" + chatId, (data) => {
    $("#chatName").text(getChatName(data))
  });

  $.get("/api/chats/" + chatId  + "/messages/", (data) => {
    var messages = [];
    var lastSenderId = "";

    data.forEach((msg, i) => {
      var html = createMessageHtml(msg, data[i + 1], lastSenderId);
      messages.push(html);

      lastSenderId = msg.sender._id;

    });

    var messagesHtml = messages.join("");

    addMessagesHtmlToPage(messagesHtml);
    scrollToBottom(false);
  });

});

function addMessagesHtmlToPage(html) {

  $('.chatMessages').append(html);

}

$('#chatNameButton').click(() => {

  var name = $("#chatNameTextbox").val().trim();
  console.log(name);

  $.ajax({
    url: "/api/chats/" + chatId,
    type: "PUT",
    data: { chatName: name },
    success: (data, status, xhr) => {
      if(xhr.status != 204) {
        alert("Could not update !");
      } else {
        location.reload();
      }
    }
  })

});


$(".inputTextbox").on("keydown", (e) => {

  if(e.which === 13) {
    messageSubmitted();
    return false; // dont do the regular behaviour
  }

});

$(".sendMessageButton").click(() => {
  messageSubmitted()
});

function messageSubmitted() {

  var c = $(".inputTextbox").val().trim();

  if(c != "") {
    sendMessage(c)
    $(".inputTextbox").val("");
  }

}

function sendMessage(content) {

  $.post("/api/messages", { content, chatId }, (data, status, xhr) =>{

    if(xhr.status != 201) {
      alert('could not send message')
      $(".inputTextbox").val(content)
      return;
    }

    addChatMessageHtml(data)

  });

}

function addChatMessageHtml(message) {

  if(!message || !message._id) {
    alert('message is not valid !');
    return;
  }

  var messageDiv = createMessageHtml(message, null, "");

  addMessagesHtmlToPage(messageDiv);
  scrollToBottom(true);
}

function  createMessageHtml(message, nextMessage, lastSenderId) {

  var sender = message.sender;
  var senderName = sender.firstName + ' ' + sender.lastName;
  var currentSenderId = sender._id;
  var nextSenderId = nextMessage  != null ? nextMessage.sender._id : "";

  var isFirst = lastSenderId != currentSenderId;
  var isLast = nextSenderId != currentSenderId;


  var isMine = message.sender._id == userLoggedIn._id;
  var licClassName = isMine ? 'mine' : 'theirs';

  var nameElement = "";

  if(isFirst) {
    licClassName += ' first';
    if(!isMine) {
      nameElement = `<span class='senderName'> ${senderName} </span>`;
    }
  }

  var profileImage = "";

  if(isLast) {
    licClassName += ' last';
    profileImage = `<img src='${sender.profilePic}' />`
  }

  var imageContainer = "";

  if(!isMine) {
    imageContainer = `
      <div class='imageContainer'>
        ${profileImage}
      </div>
    `;
  }

  return `
  <li class='message ${licClassName}'>
    ${imageContainer}
    <div class='messageContainer'>
      ${nameElement}
      <span class='messageBody'>
        ${message.content}
      </span>
    </div>
  </li>
  `;

}

function scrollToBottom(animated) {
  var container = $(".chatMessages");
  var scrollHeight = container[0].scrollHeight;

  if(animated) {
    container.animate({ scrollTop: scrollHeight }, "slow");
  } else {
    container.scrollTop(scrollHeight);
  }

}