var connected = false;

var socket = io("http://127.0.0.1");

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
