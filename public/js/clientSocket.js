var connected = false;

var socket = io("http://127.0.0.1");

socket.emit('setup', userLoggedIn);

// we are connected to the server
socket.on('connected', () => {
  connected = true;
});

