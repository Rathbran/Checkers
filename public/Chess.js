var k = 30;
var playing = true;
var socket = io();
var pieces = [];
var moves = [];
var selected = -1;
var turn = 1;
var leftC = -1;
var rightC = -1;
var sprites;

function Center(i) {
  return i * k + k / 2;
}

function highlight(x,y,color){
  noFill();
  stroke(color);
  square(x * k, y * k, k)
  noStroke();
}

function Move(valid,x,y){
  this.valid = valid;
  this.team;
  this.x = x;
  this.y = y;
}

function moveTill(team, x, y, id, Others){
  let take = testtake(team, x, y, id, Others);
  if (take == 0){
    take = testmove(x, y, id, Others)
  }
  return take;
}

function testmove(x,y, id, Others){
  if (x >= 0 && x < 8 && y >= 0 && y < 8){
    let potential = new Move(true, x, y);
    potential.valid = 0;
    for (i = 0; i < Others.length; i++){
      if (Others[i].dead == false){
        if (Others[i].x == potential.x && Others[i].y == potential.y){
          potential.valid = 1;
        }
      }
    }
    return potential.valid
  }
}

function testtake(Team, x, y, id, Others){
  let potential = new Move(false, x, y);
  potential.valid = 0;
  for (i = 0; i < Others.length; i++){
    if (Others[i].dead == false){
      if (Others[i].x == potential.x && Others[i].y == potential.y){
        if (Others[i].player == Team){
          potential.valid = 1;
        }else if (testPiece('king', potential.x, potential.y) != -1){
          potential.valid = 3;
        }else {
          potential.valid = 2;
        }
      }
    }
  }
  return potential.valid;
}

function testPiece(piece,x,y){
  var id = -1;
  for (i = 0; i < pieces.length; i++){
    if (pieces[i].dead == false){
      if (pieces[i].x == x && pieces[i].y == y){
        if (pieces[i].type == piece){
           id = i;
        }
      }
    }
  }
  return id;
}

function testBlock(block, move, check){
  let test = pieces
  var stopped;
  test[block] = makeMove(block,move,test[block]);
  console.log(check)
  switch (test[check].type) {
    case 'pawn':
      stopped = test[check].movepawn(block, test);
      break;

    case 'rook':
      stopped = test[check].moverook(block, test);
      break;

    case 'knight':
      stopped = test[check].moveknight(block, test);
      break;

    case 'bishop':
      stopped = test[check].movebishop(block, test);
      break;

    case 'queen':
      stopped = test[check].movequeen(block, test);
      break;

    case 'king':
      stopped = test[check].moveking(block, test);
      break;
  }
  return test[check].check;
}

function incheck(checkwhite, checkblack){
  var checkmate = true;
  var blocked = 0;

  for (n = 0; n < moves.length; n++){
    for (i = 0; i < moves[n].length; i++){

      if (turn == 1){
        for (c = 0; c < checkwhite.length; c++){
          moves[n][i].valid = testBlock(n,i, pieces[checkwhite[c]])
        }
      }else{
        for (c = 0; c < checkblack.length; c++){
          moves[n][i].valid = testBlock(n,i, pieces[checkblack[c]])
        }
      }
    }
  }

  for (n = 0; n < moves.length; n++){
    i = 0
    while (i < moves[n].length){
      if (moves[n][i].valid == false){
        moves[n][i].splice(i,1);
      }else{
        i++;
      }
    }
  }
  return checkmate;
}

function logic(){
  moves.splice(0,moves.length);

  var checkwhite = [];
  var checkblack = [];

  var take;

  for (n = 0; n < pieces.length; n++){
    if (pieces[n].dead == false){
      switch (pieces[n].type) {
        case 'pawn':
          moves[n] = pieces[n].movepawn(n, pieces);
          break;

        case 'rook':
          moves[n] = pieces[n].moverook(n, pieces);
          break;

        case 'knight':
          moves[n] = pieces[n].moveknight(n, pieces);
          break;

        case 'bishop':
          moves[n] = pieces[n].movebishop(n, pieces);
          break;

        case 'queen':
          moves[n] = pieces[n].movequeen(n, pieces);
          break;

        case 'king':
          moves[n] = pieces[n].moveking(n, pieces);
          break;
      }
      if (pieces[n].check == true){
        if (pieces[n].player == 1){
          checkwhite.push(n);
        }else{
          checkblack.push(n);
        }
      }
    }
  }
  var checkmate = incheck(checkwhite, checkblack);
  console.log(checkmate);
  //if (checkmate == true){
  //  playing = false;
  //}
}

function Piece(x,y,type,team){
  this.type = type;
  this.player = team;
  this.check = false;
  this.threatened = false;
  this.x = x;
  this.y = y;
  this.moves = 0;
  this.dead = false;
  this.display = function(){
    //piece sprite
    if (this.dead == false){
      switch (this.type){
        case 'pawn':
          if (this.player == 1){
            image(sprites.pawnW, this.x * k, this.y * k);
          }else{
            image(sprites.pawnB, this.x * k, this.y * k);
          }
        break;
        case 'rook':
          if (this.player == 1){
            image(sprites.rookW, this.x * k, this.y * k);
          }else{
            image(sprites.rookB, this.x * k, this.y * k);
          }
        break;
        case 'knight':
          if (this.player == 1){
            image(sprites.knightW, this.x * k, this.y * k);
          }else{
            image(sprites.knightB, this.x * k, this.y * k);
          }
        break;
        case 'bishop':
          if (this.player == 1){
            image(sprites.bishopW, this.x * k, this.y * k);
          }else{
            image(sprites.bishopB, this.x * k, this.y * k);
          }
        break;
        case 'queen':
          if (this.player == 1){
            image(sprites.queenW, this.x * k, this.y * k);
          }else{
            image(sprites.queenB, this.x * k, this.y * k);
          }
        break;
        case 'king':
          if (this.player == 1){
            image(sprites.kingW, this.x * k, this.y * k);
          }else{
            image(sprites.kingB, this.x * k, this.y * k);
          }
        break;
      }
    }
  }
  this.movequeen = function(id, Others){
    let n = 1;
    let moves = [];
    var check = false;
    //loop forward
    var take = 0
    while (take == 0 && (this.y + n) < 8){
      take = moveTill(this.player,  this.x, this.y + n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x, this.y + n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop right
    take = 0
    while (take == 0 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + n, this.y))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop left
    take = 0
    while (take == 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - n, this.y))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop backwards
    take = 0
    while (take == 0 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x, this.y - n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x, this.y - n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y + n) < 8 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y + n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + n, this.y + n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x + n) < 8 && (this.y + n) < 8){
      take = moveTill(this.player, this.x + n, this.y - n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + n, this.y - n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x - n) >= 0 && (this.y + n) < 8){
      take = moveTill(this.player, this.x - n, this.y + n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - n, this.y + n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y - n) >= 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y - n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - n, this.y - n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    this.check = check;
    return moves;
  }
  this.moveking = function(id, Others){
    let moves = [];
    //1 block away movement
    for (plx = -1; plx <= 1; plx++){
      for (ply = -1; ply <= 1; ply++){
        take = testtake(this.player, this.x + plx, this.y + ply, id, Others);
        if (take == 0){
          take = testmove(this.x + plx, this.y + ply, id, Others);
        }
        if (take == 0 || take == 2){
          moves.push(new Move(true, this.x + plx, this.y + ply))
        }
      }
    }
    //castleing
    rightC = -1;
    leftC = -1;
    var n = 1;
    var space = 0;
    if (this.moves == 0){
      //loop right
      while(space < 1 && (this.x + n) < 8){
        space = testtake(this.player, this.x + n, this.y, id, Others)
        if (space == 1){
          castle = testPiece('rook', this.x + n, this.y, Others);
          if (castle != -1){
            if (pieces[castle].moves == 0){
              rightC = castle;
              moves.push(new Move(true, this.x + n, this.y));
            }
          }
        }
        n++
      }

      //loop left
      n = 1;
      space = 0;
      while(space < 1 && (this.x - n) >= 0){
        space = testtake(this.player, this.x - n, this.y, id, Others)
        if (space == 1){
          castle = testPiece('rook', this.x - n, this.y, Others);
          if (castle != -1){
            if (pieces[castle].moves == 0){
              leftC = castle;
              moves.push(new Move(true, this.x - n, this.y));
            }
          }
        }
        n++
      }
    }
    return moves;
  }
  this.movepawn = function(id, Others){
    let moves = [];
    let check = false;
    //move forwards
    let take = testmove(this.x, this.y + this.player, id, Others)
    //first move
    if (take == 0){
      moves.push(new Move(true, this.x, this.y + this.player))
    }

    if (this.moves == 0){
      take = testmove(this.x, this.y + 2 * this.player, id, Others)
    }
    if (take == 0){
      moves.push(new Move(true, this.x, this.y + 2 * this.player))
    }
    //take diagonal
    take = testtake(this.player, this.x + 1, this.y + this.player, id, Others);
    if (take == 3){
      check = true;
    }else if (take == 2){
      moves.push(new Move(true, this.x + 1, this.y + this.player))
    }
    take = testtake(this.player, this.x - 1, this.y + this.player, id, Others);
    if (take == 3){
      check = true;
    }else if (take == 2){
      moves.push(new Move(true, this.x - 1, this.y + this.player))
    }
    this.check = check;
    return moves;
  }
  this.moverook = function(id, Others){
    let moves = [];
    let check = false;
    let n = 1;
    //loop forward
    take = 0;
    while (take == 0 && (this.y + n) < 8){
      take = moveTill(this.player,  this.x, this.y + n, id, Others);
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x, this.y + n))
      }
      n++;
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop right
    take = 0;
    while (take == 0 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y, id, Others);
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + n, this.y))
      }
      n++;
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop left
    take = 0;
    while (take == 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y, id, Others);
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - n, this.y))
      }
      n++;
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop backwards
    take = 0;
    while (take == 0 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x, this.y - n, id, Others);
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x, this.y - n))
      }
      n++;
    }
    if (take == 3){
      check = true;
    }
    this.check = check;
    return moves;
  }
  this.movebishop = function(id, Others){
    let moves = [];
    let check = false;
    let n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y + n) < 8 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y + n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + n, this.y + n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x + n) < 8 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x + n, this.y - n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + n, this.y - n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x - n) >= 0 && (this.y + n) < 8){
      take = moveTill(this.player, this.x - n, this.y + n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - n, this.y + n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y - n) >= 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y - n, id, Others)
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - n, this.y - n))
      }
      n++
    }
    if (take == 3){
      check = true;
    }
    this.check = check;
    return moves;
  }
  this.moveknight = function(id, Others){
    //2 over + left right
    let moves = [];
    var check = false;
    for (r = -1; r <= 1; r+=2){
      take = testtake(this.player, this.x + r, y + 2, id, Others);
      if (take == 0){
        take = testmove(this.x + r, y + 2, id, Others);
      }else if(take == 3){
        check = true;
      }
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + r, y + 2))
      }
      take = testtake(this.player, this.x + r, y - 2, id, Others);
      if (take == 0){
        testmove(this.x + r, y - 2, id, Others);
      }else if(take == 3){
        check = true;
      }
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + r, y - 2))
      }
      take = testtake(this.player, this.x + 2, y + r, id, Others);
      if (take == 0){
        testmove(this.x + 2, y + r, id, Others);
      }else if(take == 3){
        check = true;
      }
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x + 2, y + r))
      }
      take = testtake(this.player, this.x - 2, y + r, id, Others);
      if (take == 0){
        testmove(this.x - 2, y + r, id, Others);
      }else if(take == 3){
        check = true;
      }
      if (take == 0 || take == 2){
        moves.push(new Move(true, this.x - 2, y + r))
      }
    }
    this.check = check;
    return moves;
  }
}

function initializeGame(){
  for (x = 0; x < 8; x++){
    for (y = 0; y < 8; y++){
      var team = '';
      var piece = '';
      if (y < 2){
        team = 1;
      }else if(y > 5){
        team = -1;
      }else{
        team = 0;
      }

      if (y == 0 || y == 7){
        if (x == 0 || x == 7){
          //piece = 'rook';
        } else if((x == 1 || x == 6)){
          //piece = 'knight';
        } else if((x == 2 || x == 5)){
          //piece = 'bishop';
        } else if(x == 3){
          piece = 'queen';
        } else if(x == 4){
          piece = 'king';
        }
      }else{
        //piece = 'pawn';
      }

      if (team != 0){
        if (piece != ''){
          pieces.push(new Piece(x,y,piece,team))
        }
      }
    }
  }
  logic();
  playing = true;
}

function preload(){
  //Piece Sprites
  sprites = {
    bishopB : loadImage('../Sprites/Chess/BishopB.png'),
    bishopW : loadImage('../Sprites/Chess/BishopW.png'),
    rookB : loadImage('../Sprites/Chess/RookB.png'),
    rookW : loadImage('../Sprites/Chess/RookW.png'),
    kingB : loadImage('../Sprites/Chess/KingB.png'),
    kingW : loadImage('../Sprites/Chess/KingW.png'),
    queenB : loadImage('../Sprites/Chess/QueenB.png'),
    queenW : loadImage('../Sprites/Chess/QueenW.png'),
    knightB : loadImage('../Sprites/Chess/KnightB.png'),
    knightW : loadImage('../Sprites/Chess/KnightW.png'),
    pawnB : loadImage('../Sprites/Chess/PawnB.png'),
    pawnW : loadImage('../Sprites/Chess/PawnW.png'),
  }
}

function setup() {
  createCanvas(k * 11, k * 10);

  var server = 'http://localhost:3000';
  socket = io.connect(server)
  socket.emit('game', "Chess");

  sprites.bishopB.resize(k,0);
  sprites.bishopW.resize(k,0);
  sprites.rookB.resize(k,0);
  sprites.rookW.resize(k,0);
  sprites.kingB.resize(k,0);
  sprites.kingW.resize(k,0);
  sprites.queenB.resize(k,0);
  sprites.queenW.resize(k,0);
  sprites.knightB.resize(k,0);
  sprites.knightW.resize(k,0);
  sprites.pawnB.resize(k,0);
  sprites.pawnW.resize(k,0);

  initializeGame();
}

function draw() {
  background(130);
  if (playing == true){
    board();
    for (i = 0; i < pieces.length; i++){
      pieces[i].display();
    }
    if (selected != -1){
      for (m = 0; m < moves[selected].length; m++){
        highlight(moves[selected][m].x,moves[selected][m].y,'yellow');
      }
    }
  }
  selector(mouseX,mouseY,'red');
}

function makeMove(n,m,piece){
  if (leftC != -1){
    if (moves[n][m].x == pieces[leftC].x){
      pieces[leftC].x = piece.x;
      leftC = -1
    }
  }

  if (rightC != -1){
    if (moves[n][m].x == pieces[rightC].x){
      pieces[rightC].x = piece.x;
      rightC = -1
    }
  }
  console.log(piece)
  piece.x = moves[n][m].x;
  piece.y = moves[n][m].y;
  piece.moves++;

  //taking
  return piece;
}

function mousePressed(){
  if ((mouseX > 0 && mouseX < 8 * k) && (mouseY > 0 && mouseY < 8 * k)) {
    n = 1
    m = 0;
    while (selected != -1 && m < n){
      n = moves[selected].length;

      if (floor(mouseX/k) == moves[selected][m].x && floor(mouseY/k) == moves[selected][m].y){
        pieces[n] = makeMove(selected, m, pieces[n]);
        for (i = 0; i < pieces.length; i++){
          if (pieces[i].x == moves[selected][m].x && pieces[i].y == moves[selected][m].y && pieces[i].player != turn){
              pieces[i].dead = true;
          }
        }
        turn *= -1;
        selected = -1;
        logic();
      }
      m++;
    }
    for (i = 0; i < pieces.length; i++){
      if (floor(mouseX/k) == pieces[i].x && floor(mouseY/k) == pieces[i].y && pieces[i].player == turn){
        selected = i;
      }
    }
  }
}

function board(){
  stroke('black')
  for (x = 0; x < 8; x++){
    for (y = 0; y < 8; y++){
      if ((x + y) % 2 == 0){
        fill('purple');
      }else{
        fill('white');
      }
      square(x*k,y*k,k);
    }
  }
  if (turn == 1){
    fill('white');
  }else{
    fill('black');
  }
  circle(9*(k), k, k);
}

function selector(x,y,color){
  fill(color);
  circle(x,y,k/4);
  if (selected != -1){
    highlight(pieces[selected].x,pieces[selected].y,color);
  }
}
