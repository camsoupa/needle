var io = require('socket.io-client'),
    socket = io.connect('http://localhost:3000');

socket.on('connect', function () { console.log("socket connected"); });

socket.on('stdout', function (data) {
  console.log('data');
  process.stdout.write(data);
});

socket.on('stderr', function (data) {
  process.stderr.write(data);
});

process.stdin.on('data', function (data) {
  socket.emit('command', data);
});
