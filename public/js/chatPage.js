
$(document).ready(() => {

  $.get("/api/chats/" + chatId, (data) => {
    $("#chatName").text(getChatName(data))
  });

  $.get("/api/chats/" + chatId  + "/messages/", (data) => {
    var messages = [];
    data.forEach(msg => {
      var html = createMessageHtml(msg);
      messages.push(html);
    });
    var messagesHtml = messages.join("");
  });

});

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

  var messageDiv = createMessageHtml(message);

  $('.chatMessages').append(messageDiv);

}

function  createMessageHtml(message) {

  var isMine = message.sender._id == userLoggedIn._id;
  var licClassName = isMine ? 'mine' : 'theirs';

  return `
  <li class='message ${licClassName}'>
    <div class='messageContainer'>
      <span class='messageBody'>
        ${message.content}
      </span>
    </div>
  </li>
  `;

}