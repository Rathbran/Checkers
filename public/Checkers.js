
Checkers:

function OpenFile(data){
  let item = [];
  item = split(data.state,';');
  for(x = 0; x < 10; x++){
    item[x] = split(item[x], ',');
    for(y = 0; y < 10; y++){
      Board[x][y] = item[x][y];
    }
  }
}

function SaveFile(){
  let msg = "";
  for(x = 0; x < 10; x++){
    for(y = 0; y < 10; y++){
      msg = msg + Board[x][y] + ",";
    }
    msg = msg + ";";
  }
  var data = {
    state: msg,
  }
  socket.emit('state', data);
}

function selected() {
  this.x = 0;
  this.y = 0;
  this.plr = 0;
  this.Queen = 1;
}

var socket = io();

var playing = false;
var k = 30;
var Counter = -1;
var Turn = new selected();
var Board = [];
var Step = 1;
var Streak = new selected();
var Piece = 'white';
var OpponantX = 0;
var OpponantY = 0;

function setup() {
  createCanvas(k * 10 + k, k * 10);
  background('white');

  Play = createButton('-Play-');
  Play.position(k * 4.75, k * 4.5);
  Play.mouseClicked(StartGame);
  var Server = 'https://1d6e15c5c1de.ngrok.io';
  //var Server = 'http://localhost:3000';

  socket = io.connect(Server);

  socket.emit('game', "Checkers");

  socket.on('Changestate', OpenFile);
  socket.on('Turn', Turnover);
  socket.on('mouse', recieved);
}

function mouseDragged(){
  var data = {
    x: mouseX,
    y: mouseY,
  }
  socket.emit('mouse',data);

  noStroke();
  fill('black');
  circle(data.x,data.y,k/8);
}

function recieved(data){
  OpponantX = data.x;
  OpponantY = data.y;
}

function Turnover(data){
  Counter = data.turn;
}

function StartGame() {
  InitializeGame();
  Play.hide();
  playing = true;
}

function board(selected) {
  for (y = 0; y < 10; y++) {
    for (x = 0; x < 10; x++) {
      if ((x + y) % 2 == 0) {
        fill('red');
      } else {
        fill('black');
      }
      if (x == Turn.x && y == Turn.y) {
        stroke(selected);
      } else {
        stroke('rgba(10,10,100, 0.5)');
      }
      square(x * k, y * k, k);
    }
  }
  stroke('white');
}

function InitializeGame() {
  for (x = 0; x < 10; x++) {
    Board[x] = [];
    for (y = 0; y < 10; y++) {
      if ((x + y) % 2 == 0) {
        if (y < 3) {
          Board[x][y] = 1;
        } else if (y >= 7) {
          Board[x][y] = -1;
        } else {
          Board[x][y] = 0;
        }
        drawpiece(Board[x][y], x, y);
      }else{
        Board[x][y] = 0;
      }
    }
  }
  SaveFile();
}

function Center(i) {
  return i * k + k / 2;
}

function drawpiece(Piece, x, y) {
  if (Piece > 0) {
    fill('blue');
    circle(Center(x), Center(y), k / 2);
    if(Piece > 1) {
      square(x, y, k / 4);
    }
  } else if (Piece < 0) {
    fill('black');
    circle(Center(x), Center(y), k / 2);
    if(Piece < -1) {
      square(Center(x), Center(y), k / 4);
    }
  }
}

function Jump(place, origin) {
  let jump = new selected();
  jump.y = place.y + ((place.y - origin.y));
  jump.x = origin.x + 2 * (place.x - origin.x);
  if ((jump.x >= 0 && jump.x < 10) && (jump.y >= 0 && jump.y < 10)) {
    if (Board[jump.x][jump.y] == 0) {
      Step++;
      checkQueen(jump);
      Board[jump.x][jump.y] = origin.plr;
      Board[origin.x][origin.y] = 0;
      Streak = jump;
      print(Streak.plr);
      Board[place.x][place.y] = 0;
      return jump;
    }
  }
  Step = 1;
  EndTurn();
  return place;
}

function EndTurn(){
  if (Step == 1){
    Counter = Counter * -1;
    data = {
      turn:Counter,
    }
    socket.emit('turn', data);
  }
}

function Logic(Turn, origin) {
  if ((Turn.y == origin.y + Counter || Turn.y == origin.y + (Counter * origin.Queen)) && (Turn.x == origin.x + 1 || Turn.x == origin.x - 1) && origin.plr * Counter > 0) {
    if (Turn.plr == 0) {
      if (Step > 1) {
        Step = 1;
        EndTurn();
      }else{
        Board[origin.x][origin.y] = 0;
        Board[Turn.x][Turn.y] = origin.plr;
        EndTurn();
      }
    } else if (Turn.plr/origin.plr < 0){
      Turn = Jump(Turn, origin);
    } else {
      Step = 1;
      EndTurn();
    }
    Turn.plr = Board[Turn.x][Turn.y];
    SaveFile();
  }else {
    if (Step > 1){
      Step = 1;
      EndTurn();
    }
  }
}

function mousePressed() {
  if (playing == true) {
    if ((mouseX > 0 && mouseX < 10 * k) && (mouseY > 0 && mouseY < 10 * k)) {
      let origin = new selected();
      if (Step == 1) {
        origin.x = Turn.x;
        origin.y = Turn.y;
        origin.plr = Turn.plr;
        if ((origin.plr * origin.plr) > 1) {
          origin.Queen = -1;
        } else {
          origin.Queen = 1;
        }
        Piece = 'white';
      } else {
        origin.x = Streak.x;
        origin.y = Streak.y;
        origin.plr = Streak.plr;
        if ((origin.plr * origin.plr) > 1) {
          origin.Queen = -1;
        } else {
          origin.Queen = 1;
        }
        Piece = 'yellow';
      }

      Turn.x = floor(mouseX / k);
      Turn.y = floor(mouseY / k);
      Turn.plr = Board[Turn.x][Turn.y];

      Logic(Turn, origin);
      checkQueen(Turn);
    }
  }
}

function Lay(){
  for (x = 0; x < 10; x++) {
    for (y = 0; y < 10; y++) {
      drawpiece(Board[x][y], x, y);
    }
  }
  drawpiece(Counter, 10, 0);

  noStroke();
  fill('yellow');
  circle(OpponantX,OpponantY,k/4);
  fill('green');
  circle(mouseX,mouseY,k/4);
}

function checkQueen(Piece) {
  if (Piece.y == 0 && Piece.plr == -1) {
    Board[Piece.x][Piece.y] *= 2;
  } else if (Piece.y == 9 && Piece.plr == 1) {
    Board[Piece.x][Piece.y] *= 2;
  }
}

function keyPressed() {
  if (key == "p") {
    StartGame();
    key = "";
  }
  if (key == 'l') {
    ++k;
    resizeCanvas(k * 10 + k, k * 10);
    key = "";
  }
  if (key == 'u') {
    --k;
    resizeCanvas(k * 10 + k, k * 10);
    key = "";
  }
}

function mouseMoved(){
  var data = {
    x: mouseX,
    y: mouseY,
  }
  socket.emit('mouse',data);
}

function draw() {
  if (playing == true){
    board(Piece);
    Lay();
  }
}
