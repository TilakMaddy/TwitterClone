$(document).ready(() => {
  $.get("/api/chats", (data, status, xhr) => {

    if(xhr.status == 400) {
      return alert("Could not get chat list !");
    }

    outputChatResults(data, $(".resultsContainer"));

  })
});
