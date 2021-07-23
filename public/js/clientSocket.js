var connected = false;

var socket = io("https://twitter-in-nodejs.herokuapp.com/");

socket.emit('setup', userLoggedIn);

// we are connected to the server
socket.on('connected', () => {
  connected = true;
});

socket.on('message received', newMessage => {
  messageReceived(newMessage);
})

socket.on('notification received', newNotif => {

  $.get("/api/notifications/latest", (data) => {
    showNotificationPopup(data);
    refreshNotificationsBadge();
  })

})

function emitNotification(userId) {

  if(userId == userLoggedIn._id) {
    return;
  }

  socket.emit('notification received', userId)

}
