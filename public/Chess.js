var k = 30;
var playing = true;
var socket = io();

var selected = -1;
var turn = 1;
var leftC = -1;
var rightC = -1;
var sprites;

var board = {
  x : 8,
  y : 8,

  selected : -1,

  pieces : [],
  spaces : [],

  whiteking : 0,
  blackking : 0,

  populate : function(){
    this.pieces.splice(0, this.pieces);
    for(x = 0; x < this.x; x++){
      for(y = 0; y < this.y; y++){
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
            piece = 'rook';
          } else if((x == 1 || x == 6)){
            piece = 'knight';
          } else if((x == 2 || x == 5)){
            piece = 'bishop';
          } else if(x == 3){
            piece = 'queen';
          } else if(x == 4){
            piece = 'king';
          }
        }else{
          piece = 'pawn';
        }
        if (team != 0){
          if (piece != ''){
            this.pieces.push(new Piece(x,y,piece,team))
            if (piece == 'king'){
              if (team == 1){
                this.whiteking = this.pieces.length - 1;
              }else if (team == -1){
                this.blackking = this.pieces.length - 1;
              }
            }
          }
        }
      }
    }
  },
  display : function(){
    for(x = 0; x < this.x; x++){
      for(y = 0; y < this.y; y++){
        stroke('black')
        if ((x + y) % 2 == 0){
          fill('purple');
        }else{
          fill('white');
        }
        square(x*k,y*k,k);
      }
    }
    for(i = 0; i < this.pieces.length; i++){
      this.pieces[i].display();
    }
  },
  logic : function(id){
    let moves = [];
    if (this.pieces[id].dead == false){
      switch (this.pieces[id].type) {
        case 'pawn':
          moves = this.pieces[id].movepawn(id, this.pieces);
          break;

        case 'rook':
          moves = this.pieces[id].moverook(id, this.pieces);
          break;

        case 'knight':
          moves = this.pieces[id].moveknight(id, this.pieces);
          break;

        case 'bishop':
          moves = this.pieces[id].movebishop(id, this.pieces);
          break;

        case 'queen':
          moves = this.pieces[id].movequeen(id, this.pieces);
          break;

        case 'king':
          moves = this.pieces[id].moveking(id, this.pieces);
          break;
      }
      console.log(moves)
      this.pieces[id].moves = moves;
      console.log(this.pieces[id].moves)
    }
  },
}

function Piece(x,y,type,player){
  this.type = type;
  this.player = player;

  this.x = x;
  this.y = y;

  this.moved = false;
  this.dead = false;

  this.moves = [];

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

    //loop forward
    var take = 0;
    while (take == 0 && (this.y + n) < 8){
      take = moveTill(this.player,  this.x, this.y + n, id, Others);
      moves.push(new Move(take, this.x, this.y + n));
      n++;
    }
    n = 1;
    //loop right
    take = 0
    while (take == 0 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y, id, Others)
      moves.push(new Move(take, this.x + n, this.y));
      n++;
    }
    n = 1;
    //loop left
    take = 0
    while (take == 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y, id, Others)
      moves.push(new Move(take, this.x - n, this.y));
      n++;
    }
    n = 1;
    //loop backwards
    take = 0
    while (take == 0 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x, this.y - n, id, Others)
      moves.push(new Move(take, this.x, this.y - n));
      n++;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y + n) < 8 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y + n, id, Others)
      moves.push(new Move(take, this.x + n, this.y + n));
      n++;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x + n) < 8 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x + n, this.y - n, id, Others)
      moves.push(new Move(take, this.x + n, this.y - n));
      n++;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x - n) >= 0 && (this.y + n) < 8){
      take = moveTill(this.player, this.x - n, this.y + n, id, Others)
      moves.push(new Move(take, this.x - n, this.y + n));
      n++;
    }
    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y - n) >= 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y - n, id, Others)
      moves.push(new Move(take, this.x - n, this.y - n));
      n++
    }

    return moves;
  }
  this.moveking = function(id, Others){
    let moves = [];
    //1 block away movement
    for (plx = -1; plx <= 1; plx++){
      for (ply = -1; ply <= 1; ply++){
        take = testtake(this.player, this.x + plx, this.y + ply, id, Others);
        if (take == 0){
          take = stepto(this.x + plx, this.y + ply, id, Others);
        }
        moves.push(new Move(take, this.x + plx, this.y + ply));
      }
    }
    //castleing
    rightC = -1;
    leftC = -1;
    var n = 1;
    var space = 0;
    if (this.moved == false){
      //loop right
      while(space < 1 && (this.x + n) < 8){
        space = testtake(this.player, this.x + n, this.y, id, Others)
        if (space == 1){
          castle = testPiece('rook', this.x + n, this.y, Others);
          if (castle != -1){
            if (board.pieces[castle].moves == 0){
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
            if (board.pieces[castle].moves == 0){
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

    //move forwards
    let take = stepto(this.x, this.y + this.player, id, Others)
    //first move
    if (take == 0){
      moves.push(new Move(take, this.x, this.y + this.player))
    }

    if (this.moved == false){
      take = stepto(this.x, this.y + 2 * this.player, id, Others)
      if (take == 0){
        moves.push(new Move(take, this.x, this.y + 2 * this.player))
      }
    }

    //take diagonal
    take = testtake(this.player, this.x + 1, this.y + this.player, id, Others);
    if (take > 1){
      moves.push(new Move(take, this.x + 1, this.y + this.player))
    }
    take = testtake(this.player, this.x - 1, this.y + this.player, id, Others);
    if (take > 1){
      moves.push(new Move(take, this.x - 1, this.y + this.player))
    }

    return moves;
  }
  this.moverook = function(id, Others){
    let moves = [];

    let n = 1;
    //loop forward
    take = 0;
    while (take == 0 && (this.y + n) < 8){
      take = moveTill(this.player,  this.x, this.y + n, id, Others);
      moves.push(new Move(take, this.x, this.y + n));
      n++;
    }

    n = 1;
    //loop right
    take = 0;
    while (take == 0 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y, id, Others);
      moves.push(new Move(take, this.x + n, this.y));
      n++;
    }

    n = 1;
    //loop left
    take = 0;
    while (take == 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y, id, Others);
      moves.push(new Move(take, this.x - n, this.y));
      n++;
    }

    n = 1;
    //loop backwards
    take = 0;
    while (take == 0 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x, this.y - n, id, Others);
      moves.push(new Move(take, this.x, this.y - n));
      n++;
    }

    return moves;
  }
  this.movebishop = function(id, Others){
    let moves = [];

    let n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y + n) < 8 && (this.x + n) < 8){
      take = moveTill(this.player, this.x + n, this.y + n, id, Others)
      moves.push(new Move(take, this.x + n, this.y + n));
      n++
    }

    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x + n) < 8 && (this.y - n) >= 0){
      take = moveTill(this.player, this.x + n, this.y - n, id, Others)
      moves.push(new Move(take, this.x + n, this.y - n));
      n++
    }

    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.x - n) >= 0 && (this.y + n) < 8){
      take = moveTill(this.player, this.x - n, this.y + n, id, Others)
      moves.push(new Move(take, this.x - n, this.y + n));
      n++
    }

    n = 1;
    //loop diagonal
    take = 0;
    while (take == 0 && (this.y - n) >= 0 && (this.x - n) >= 0){
      take = moveTill(this.player, this.x - n, this.y - n, id, Others)
      moves.push(new Move(take, this.x - n, this.y - n));
      n++
    }

    return moves;
  }
  this.moveknight = function(id, Others){
    //2 over + left right
    let moves = [];

    for (r = -1; r <= 1; r+=2){
      take = testtake(this.player, this.x + r, this.y + 2, id, Others);
      moves.push(new Move(take, this.x + r, this.y + 2));
      take = testtake(this.player, this.x + r, this.y - 2, id, Others);
      moves.push(new Move(take, this.x + r, this.y - 2));
      take = testtake(this.player, this.x + 2, this.y + r, id, Others);
      moves.push(new Move(take, this.x + 2, this.y + r));
      take = testtake(this.player, this.x - 2, this.y + r, id, Others);
      moves.push(new Move(take, this.x - 2, this.y + r));
    }

    return moves;
  }
}

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
  this.prWhite = false;
  this.prBlack = false;
  this.valid = valid;
  this.team;
  this.x = x;
  this.y = y;
}

function moveTill(team, x, y, id, Others){
  let take = testtake(team, x, y, id, Others);
  if (take == 0){
    take = stepto(x, y, id, Others)
  }
  return take;
}

function stepto(x,y, id, Others){
  if (x >= 0 && x < 8 && y >= 0 && y < 8){
    let potential = new Move(0, x, y);
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
  if (x >= 0 && x < 8 && y >= 0 && y < 8){
    let potential = new Move(0, x, y);
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
}

function testPiece(piece,x,y){
  var id = -1;
  for (i = 0; i < board.pieces.length; i++){
    if (board.pieces[i].dead == false){
      if (board.pieces[i].x == x && board.pieces[i].y == y){
        if (board.pieces[i].type == piece){
           id = i;
        }
      }
    }
  }
  return id;
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

function StartGame(){
  board.populate();
  var i;
  for (i = 1; i < board.pieces.length; i++){
    console.log(i)
    console.log(board.pieces.length)
    board.logic(i);
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


}

function draw() {
  background(130);
  if (playing == true){
    board.display();
    if (turn == 1){
      fill('white');
    }else{
      fill('black');
    }
    circle(9*(k), k, k);

    if (selected != -1){
      for (m = 0; m < board.pieces[selected].moves.length; m++){
        if (board.pieces[selected].moves[m].valid != 1 && board.pieces[selected].moves[m].valid != 3){
          highlight(board.pieces[selected].moves[m].x,board.pieces[selected].moves[m].y,'yellow');
        }
      }
    }
  }
  selector(mouseX,mouseY,'red');
}

function selector(x,y,color){
  fill(color);
  circle(x,y,k/4);
  if (selected != -1){
    highlight(board.pieces[selected].x,board.pieces[selected].y,color);
  }
}

function Scanboard(Board, selected, move){
  let spaces = [];
  for(x = 0; x < this.x; x++){
    spaces[x] = []
    for(y = 0; y < this.y; y++){
      spaces[x][y] = new Move(true,x,y);
    }
  }
  makeMove(selected, move, Board.piece[selected], Board)
  for (n = 0; n < Board.pieces.length; n++){
    Board.logic(n);
    for (p = 0; p < Board.moves.length; p++){
      if (Board.pieces[n].player == 1){
        spaces[moves[p].x][moves[p].y].prWhite = true;
      }else if (Board.pieces[n].player == -1){
        spaces[moves[p].x][moves[p].y].prBlack = true;
      }
    }
  }
  if (Board.spaces[Board.pieces[whiteking].x][Board.pieces[whiteking].y].prBlack == true){
    return false;
  }else if (Board.spaces[Board.pieces[blackking].x][Board.pieces[blackking].y].prWhite == true){
    return false;
  }else{
    return true;
  }

}

function keyPressed(key){
  if (key = 'p'){
    StartGame();
  }
}

function makeMove(n,m,piece,board){
  if (leftC != -1){
    if (board.pieces[n].moves[m].x == board.pieces[leftC].x){
      board.pieces[leftC].x = piece.x;
      leftC = -1
    }
  }

  if (rightC != -1){
    if (board.pieces[n].moves[m].x == board.pieces[rightC].x){
      board.pieces[rightC].x = piece.x;
      rightC = -1
    }
  }
  piece.x = board.pieces[n].moves[m].x;
  piece.y = board.pieces[n].moves[m].y;
  board.pieces[n] = piece;
  board.pieces[n].moved = true
  //taking
  for (var i = 0; i < board.pieces.length; i++){
    if (board.pieces[i].x == board.pieces[n].moves[m].x && board.pieces[i].y == board.pieces[n].moves[m].y && board.pieces[i].player != turn){
        board.pieces[i].dead = true;
    }
  }
  return piece;
}

function mousePressed(){
  if ((mouseX > 0 && mouseX < 8 * k) && (mouseY > 0 && mouseY < 8 * k)) {
    move = 0;
    while (selected != -1 && move < board.pieces[selected].moves.length){
      if (floor(mouseX/k) == board.pieces[selected].moves[move].x && floor(mouseY/k) == board.pieces[selected].moves[move].y){
        // let test = board;
        // console.log(test)
        // if (Scanboard(test, selected, move) == true){
          board.pieces[selected] = makeMove(selected, move, board.pieces[selected],board);
          board.logic(selected);
          selected = -1;
          turn *= -1;
        // }else{
        //   selected = -1;
        // }

      }
      move++;
    }
    for (i = 0; i < board.pieces.length; i++){
      if (floor(mouseX/k) == board.pieces[i].x && floor(mouseY/k) == board.pieces[i].y && board.pieces[i].player == turn && board.pieces[i].dead == false){
        selected = i;
      }
    }
  }
}
