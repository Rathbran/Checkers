var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log('socket server is running');

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

var players = [];

function newConnection(socket){
  players.push(socket.id);
  console.log('New Connection: ' + socket.id);

  socket.on('state', transmit);
  socket.on('mouse', mouseMsg);
  socket.on('turn',turnchange);
    socket.on('endTurnChess', chessTurn);
    socket.on('startNewGame', startChess);
  socket.on('game', function(data){
    socket.join(data);
  });

    function startChess(data) {
        console.log('starting game');
      io.in('Chess').emit('newGame', data);
  }
  function chessTurn(data){
    socket.to('Chess').emit('Chessturn', data);
  }
  function mouseMsg(data){
    socket.to('Checkers').emit('mouse', data);
  }
  function turnchange(data){
    socket.to('Checkers').emit('Turn', data);
  }
  function transmit(data){
    io.to('Checkers').emit('Changestate', data);
  }
}
