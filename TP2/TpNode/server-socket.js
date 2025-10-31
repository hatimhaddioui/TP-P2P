const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req,res)=> res.sendFile(__dirname + '/socket-client.html'));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('runCommand', (cmd) => {
    const { exec } = require('child_process');
    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      socket.emit('commandResult', { err: err && err.message, stdout, stderr });
    });
  });
  socket.on('disconnect', () => console.log('user disconnected'));
});

server.listen(8888, ()=> console.log('Socket server running on 8888'));
