var socket = io();
var geosize = 30;
const boardSize = 13;
var snakeSize;
var boardState = [];
var direction = '';
var LOL;
var game = false;
var headX;
var headY;

function initializeGame(){
  for(x = 0; x < boardSize; x++){
    boardState[x] = [];
    for(y = 0; y < boardSize; y++){
      boardState[x][y] = 0;
    }
  }

  var b = 0;
  var d = 0;
  headX = 0;
  headY = 0;

  while(headX==b && headY==d){
    headX = floor(random(2,boardSize - 4));
    b = floor(random(2,boardSize - 4));
    headY = floor(random(2,boardSize - 4));
    d = floor(random(2,boardSize - 4));
  }
  snakeSize = 1;
  boardState[headX][headY] = 1;
  boardState[b][d] = -1;
  game = true;
}

function keyPressed() {
  if (key == 'p'){
    initializeGame();
  }
  direction = key;

}

function setup() {
  createCanvas(400, 400);
  background(220);
  var Server = 'http://localhost:3000';
  frameRate(5);
  socket = io.connect(Server)
  socket.emit('game', "Snake");

  initializeGame();
}

function draw() {
  if(game == true){
    Board();
      if(LOL == 'w'){
        if (direction != 's'){
          LOL = direction;
        }
      }else if (LOL == 's'){
        if (direction != 'w'){
          LOL = direction;
        }
      }else if (LOL == 'a'){
        if (direction != 'd'){
          LOL = direction;
        }
      }else if (LOL == 'd'){
        if (direction != 'a'){
          LOL = direction;
        }
      }else{
        LOL = direction
      }

    gametick(LOL);
  }
}

function gametick(Direction){

  for(x = 0; x < boardSize; x++){
    for(y = 0; y < boardSize; y++){
      if (boardState[x][y] > 0){
        if (boardState[x][y] == snakeSize){
          headX = x;
          headY = y;
        }
        boardState[x][y]--;
      }
    }
  }

  switch(Direction) {
    case 'd':
      headX = headX + 1;
      break;
    case 'a':
      headX = headX - 1;
      break;
    case 'w':
      headY = headY - 1;
      break;
    case 's':
      headY = headY + 1;
      break;
  }

  if (headX > boardSize - 1 || headX < 0 || headY > boardSize - 1 || headY < 0){
    game = false;
  }else{
    if (boardState[headX][headY] == -1){
      var a = floor(random(0,boardSize - 1));
      var b = floor(random(0,boardSize - 1));
      while(boardState[a][b] != 0){
        a = floor(random(5,boardSize - 5));
        b = floor(random(5,boardSize - 5));
      }
      boardState[a][b] = -1;
      snakeSize++;
    }else if (boardState[headX][headY] > 0){
      game = false;

    }
    boardState[headX][headY] = snakeSize;
  }
}

function Board(){
  for(x = 0; x < boardSize; x++){
    for(y = 0; y < boardSize; y++){
      if (boardState[x][y] > 0){
        fill('black');

      }else if(boardState[x][y] == -1){
        fill('red');
      }else {
        fill('white');
      }

      square(x*geosize,y*geosize,geosize);
    }
  }
}
