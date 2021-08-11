//Declarations
var socket = io();
var sprites;

var k = 30;
var turn = 1;
var playing = true;

//Board Object
var board = {
  //Board size
  x : 8,
  y : 8,

  whiteking : {
    x : 0,
    y : 0,
    check : false,
  },
  blackking : {
    x : 0,
    y : 0,
    check : false,
  },

  selectedX:-1,
  selectedY:-1,
  //spaces container
  spaces : [],

  populate : function(){
    this.spaces.splice(0,this.spaces.length);
    for(x = 0; x < this.x; x++){
      this.spaces[x] = []
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
        }else if (y == 1 || y == 6){
          piece = 'pawn';
        }
        this.spaces[x][y] = new Space(x,y);

        this.spaces[x][y].piece.type = piece;
        this.spaces[x][y].piece.player = team;
        if (piece == ''){
          this.spaces[x][y].piece.player = 0;
        }
        if (piece == 'king'){
          if (team == 1){
            this.whiteking.x = x;
            this.whiteking.y = y;
          }else if (team == -1){
            this.blackking.x = x;
            this.blackking.y = y;
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
        this.spaces[x][y].display();
      }
    }
  },
  logic : function(x,y){
    let moves = [];

    switch (this.spaces[x][y].piece.type) {
      case 'pawn':
        moves = this.spaces[x][y].movepawn();
        break;

      case 'rook':
        moves = this.spaces[x][y].moverook();
        break;

      case 'knight':
        moves = this.spaces[x][y].moveknight();
        break;

      case 'bishop':
        moves = this.spaces[x][y].movebishop();
        break;

      case 'queen':
        moves = this.spaces[x][y].movequeen();
        break;

      case 'king':
        moves = this.spaces[x][y].moveking();
        break;
    }
    this.spaces[x][y].moves = moves;
    for (i in moves){
      if (moves[i].valid == 3){
        if (this.spaces[x][y].piece.player == -1){
          this.whiteking.check = true;
        }
        if (this.spaces[x][y].piece.player == 1){
          this.blackking.check = true;
        }
      }
    }
  },
}

function Space(x,y){
  this.valid = 0;
  this.x = x;
  this.y = y;
  this.piece = new Piece(x,y,'','');
  this.moves = [];
  this.display = function(){
  //piece sprite
    switch (this.piece.type){
      case 'pawn':
        if (this.piece.player == 1){
          image(sprites.pawnW, this.x * k, this.y * k);
        }else{
          image(sprites.pawnB, this.x * k, this.y * k);
        }
      break;
      case 'rook':
        if (this.piece.player == 1){
          image(sprites.rookW, this.x * k, this.y * k);
        }else{
          image(sprites.rookB, this.x * k, this.y * k);
        }
      break;
      case 'knight':
        if (this.piece.player == 1){
          image(sprites.knightW, this.x * k, this.y * k);
        }else{
          image(sprites.knightB, this.x * k, this.y * k);
        }
      break;
      case 'bishop':
        if (this.piece.player == 1){
          image(sprites.bishopW, this.x * k, this.y * k);
        }else{
          image(sprites.bishopB, this.x * k, this.y * k);
        }
      break;
      case 'queen':
        if (this.piece.player == 1){
          image(sprites.queenW, this.x * k, this.y * k);
        }else{
          image(sprites.queenB, this.x * k, this.y * k);
        }
      break;
      case 'king':
        if (this.piece.player == 1){
          image(sprites.kingW, this.x * k, this.y * k);
        }else{
          image(sprites.kingB, this.x * k, this.y * k);
        }
      break;
    }
  }
  this.movequeen = function(){
    let n = 1;
    var moves = [];

    moves = moves.concat(this.moverook());
    moves = moves.concat(this.movebishop());
    return moves;
  }
  this.moveking = function(){
    let moves = [];
    //1 block away movement
    for (plx = -1; plx <= 1; plx++){
      for (ply = -1; ply <= 1; ply++){
        valid = testmove(this.piece.player, this.x + plx, this.y + ply);
        if (valid > 0){
          moves.push({
            x:this.x + plx,
            y:this.y + ply,
            valid: valid,
          });
        }
      }
    }
    //castleing
    var n = 1;
    var space = 1;
    if (this.piece.moved == false){
      //loop right
      while(space == 1 && (this.x + n) < 8){
        space = testmove(this.piece.player, this.x + n, this.y)
        if (space == 0){
          if (board.spaces[this.x + n][this.y].piece.type == 'rook'){
            if (board.spaces[this.x + n][this.y].piece.moved == false){
              moves.push({
                x:this.x + n,
                y:this.y,
                valid: space,
              })
            }
          }
        }
        n++
      }

      //loop left
      n = 1;
      space = 1;
      while(space == 1 && (this.x - n) >= 0){
        space = testmove(this.piece.player, this.x - n, this.y)
        if (space == 0){
          if (board.spaces[this.x - n][this.y].piece.type == 'rook'){
            if (board.spaces[this.x - n][this.y].piece.moved == false){
              moves.push({
                x:this.x - n,
                y:this.y,
                valid: space,
              })
            }
          }
        }
        n++
      }
    }
    return moves;
  }
  this.movepawn = function(){
    let moves = [];

    //move forwards
    var valid = testmove(this.piece.player, this.x, this.y + this.piece.player)
    //first move
    if (valid == 1){
      moves.push({
        x: this.x,
        y: this.y +this.piece.player,
        valid: valid,
      })
    }

    if (this.piece.moved == false){
      valid = testmove(this.piece.player, this.x, this.y + (2 * this.piece.player))
      if (valid == 1){
        moves.push({
          x: this.x,
          y: this.y + (2 * this.piece.player),
          valid: valid,
        })
      }
    }

    //take diagonal
    valid = testmove(this.piece.player, this.x + 1, this.y + this.piece.player);
    if (valid > 1){
      moves.push({
        x:this.x + 1,
        y:this.y + this.piece.player,
        valid: valid,
      })
    }
    valid = testmove(this.piece.player, this.x - 1, this.y + this.piece.player);
    if (valid > 1){
      moves.push({
        x:this.x - 1,
        y:this.y + this.piece.player,
        valid: valid,
      })
    }

    return moves;
  }
  this.moverook = function(){
    let moves = [];

    let n = 1;
    //loop forward
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x, this.y + n);
      if (valid > 0){
        moves.push({
          x:this.x,
          y:this.y + n,
          valid: valid,
        })
      }
      n++;
    }

    n = 1;
    //loop right
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x + n, this.y);
      if (valid > 0){
        moves.push({
          x:this.x + n,
          y:this.y,
          valid: valid,
        })
      }
      n++;
    }

    n = 1;
    //loop left
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x - n, this.y);
      if (valid > 0){
        moves.push({
          x:this.x - n,
          y:this.y,
          valid: valid,
        })
      }
      n++
    }

    n = 1;
    //loop backwards
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x, this.y - n);
      if (valid > 0){
        moves.push({
          x:this.x,
          y:this.y - n,
          valid: valid,
        })
      }
      n++;
    }

    return moves;
  }
  this.movebishop = function(){
    let moves = [];

    let n = 1;
    //loop diagonal
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x + n, this.y + n);
      if (valid > 0){
        moves.push({
          x:this.x + n,
          y:this.y + n,
          valid: valid,
        })
      }
      n++;
    }

    n = 1;
    //loop diagonal
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x + n, this.y - n);
      if (valid > 0){
        moves.push({
          x:this.x + n,
          y:this.y - n,
          valid: valid,
        })
      }
      n++;
    }

    n = 1;
    //loop diagonal
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x - n, this.y + n);
      if (valid > 0){
        moves.push({
          x:this.x - n,
          y:this.y + n,
          valid: valid,
        })
      }
      n++;
    }

    n = 1;
    //loop diagonal
    valid = 1;
     while (valid > 0 && valid < 2){
      valid = testmove(this.piece.player, this.x - n, this.y - n);
      if (valid > 0){
        moves.push({
          x:this.x - n,
          y:this.y - n,
          valid: valid,
        })
      }
      n++;
    }

    return moves;
  }
  this.moveknight = function(){
    //2 over + left right
    let moves = [];

    for (r = -1; r <= 1; r+=2){
      var transX = this.x + r;
      var transY =  this.y + 2;
      valid = testmove(this.piece.player, transX, transY);
      if (valid > 0){
        moves.push({
          x:transX,
          y:transY,
          valid: valid,
        })
      }
      transX = this.x + r;
      transY =  this.y - 2;
      valid = testmove(this.piece.player, transX, transY);
      if (valid > 0){
        moves.push({
          x:transX,
          y:transY,
          valid: valid,
        })
      }
      transX = this.x + 2;
      transY =  this.y + r;
      valid = testmove(this.piece.player, transX, transY);
      if (valid > 0){
        moves.push({
          x:transX,
          y:transY,
          valid: valid,
        })
      }
      transX = this.x - 2;
      transY =  this.y + r;
      valid = testmove(this.piece.player, transX, transY);
      if (valid > 0){
        moves.push({
          x:transX,
          y:transY,
          valid: valid,
        })
      }
    }
    return moves;
  }
}

function Piece(type,player){
  // team, piece
  this.type = type;
  this.player = player;
  //status
  this.moved = false;
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

function testmove(Team, x, y ){
  var valid = -1;
  if (x >= 0 && x < board.x && y >= 0 && y < board.y){
    let potential = board.spaces[x][y];
    if (potential.piece.player == Team){
      valid = 0; // same team
    }else if (potential.piece.type == ''){
      valid = 1; // empty space
    }else if (potential.piece.type == 'king'){
      valid = 3; // check
    }else {
      valid = 2; // take
    }
  }
  return valid
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
  var x;
  var y;
  for (x = 0; x < board.x; x++){
    for (y = 0; y < board.y; y++){
      board.logic(x,y);
    }
  }
  playing = true;

}

function OpenFile(data){
  for (i in data.position){
    for (j in data.position[i]){
      board.spaces[i][j].piece = data.position[i][j].piece;
    }
  }
  turn = data.turn
}

function setup() {
  createCanvas(k * 11, k * 10);

  var server = 'https://bcae0f017e6c.ngrok.io';
  socket = io.connect(server)
  socket.emit('game', "Chess");

  socket.on('Chessturn', OpenFile);

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

  playing = false;

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

    if (board.selectedX != -1 && board.selectedY != -1){
      for (m = 0; m < board.spaces[board.selectedX][board.selectedY].moves.length; m++){
        highlight(board.spaces[board.selectedX][board.selectedY].moves[m].x,board.spaces[board.selectedX][board.selectedY].moves[m].y,'yellow');
      }
    }
  }if (board.whiteking.check == true){
      highlight(board.whiteking.x,board.whiteking.y,'purple');
  }
  if (board.blackking.check == true){
      highlight(board.blackking.x,board.blackking.y,'purple')
  }
  selector(mouseX,mouseY,'red');
}

function selector(x,y,color){
  fill(color);
  circle(x,y,k/4);
  if (board.selectedX != -1 && board.selectedY != -1){
    highlight(board.selectedX,board.selectedY,color);
  }
}

function keyPressed(){
  if (key == 'p'){
    StartGame();
  }
}

function mousePressed(){
  if ((mouseX > 0 && mouseX < 8 * k) && (mouseY > 0 && mouseY < 8 * k)) {

    if (board.selectedX != -1 || board.selectedY != -1){
      var moved = false;
      if (board.spaces[board.selectedX][board.selectedY].piece.player == turn){
        for (i in board.spaces[board.selectedX][board.selectedY].moves){
          if (moved == false){
            if (board.spaces[board.selectedX][board.selectedY].moves[i].x == (floor(mouseX/k)) && board.spaces[board.selectedX][board.selectedY].moves[i].y == (floor(mouseY/k)) ){
              var test = new Space(board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].x, board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].y)
              if (board.spaces[board.selectedX][board.selectedY].moves[i].valid > 0){
                test.piece.player = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.player
                test.piece.type = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.type
                test.piece.moved = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.moved
                board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.player = board.spaces[board.selectedX][board.selectedY].piece.player;
                board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.type = board.spaces[board.selectedX][board.selectedY].piece.type;
                board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.moved = true;
                if (board.spaces[board.selectedX][board.selectedY].piece.type == 'king'){
                  if (board.spaces[board.selectedX][board.selectedY].piece.player == 1){
                    board.whiteking.x = board.spaces[board.selectedX][board.selectedY].moves[i].x;
                    board.whiteking.y = board.spaces[board.selectedX][board.selectedY].moves[i].y;
                  }else if (board.spaces[board.selectedX][board.selectedY].piece.player == -1){
                    board.blackking.x = board.spaces[board.selectedX][board.selectedY].moves[i].x;
                    board.blackking.y = board.spaces[board.selectedX][board.selectedY].moves[i].y;
                  }
                }
                board.whiteking.check = false;
                board.blackking.check = false;
                for (x = 0; x < board.x; x++){
                  for (y = 0; y < board.y; y++){
                    board.logic(x,y);
                  }
                }
                console.log(board.whiteking.check)
                console.log(board.blackking.check)
                if ((turn == 1 && board.whiteking.check == false) || (turn == -1 && board.blackking.check == false)) {
                  board.spaces[board.selectedX][board.selectedY].piece.type = '';
                  board.spaces[board.selectedX][board.selectedY].piece.player = 0;
                  moved = true;
                }else{
                  board.spaces[test.x][test.y].piece.player = test.piece.player;
                  board.spaces[test.x][test.y].piece.type = test.piece.type;
                  board.spaces[test.x][test.y].piece.moved = test.piece.moved;
                  if (board.spaces[board.selectedX][board.selectedY].piece.type == 'king'){
                    if (board.spaces[board.selectedX][board.selectedY].piece.player == 1){
                      board.whiteking.x = test.x;
                      board.whiteking.y = test.y;
                    }else if (board.spaces[board.selectedX][board.selectedY].piece.player == -1){
                      board.blackking.x = test.x;
                      board.blackking.y = test.y;
                    }
                  }
                  board.whiteking.check = false;
                  board.blackking.check = false;
                  for (x = 0; x < board.x; x++){
                    for (y = 0; y < board.y; y++){
                      board.logic(x,y);
                    }
                  }
                }
              }else{
                if (board.spaces[board.selectedX][board.selectedY].moves[i].x > board.spaces[board.selectedX][board.selectedY].x){
                  board.spaces[board.selectedX + 2][board.selectedY].piece.type = board.spaces[board.selectedX][board.selectedY].piece.type;
                  board.spaces[board.selectedX + 2][board.selectedY].piece.player = board.spaces[board.selectedX][board.selectedY].piece.player;
                  board.spaces[board.selectedX + 1][board.selectedY].piece.type = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.type;
                  board.spaces[board.selectedX + 1][board.selectedY].piece.player = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.player;
                  board.spaces[board.selectedX + 2][board.selectedY].piece.moved = true;
                  board.spaces[board.selectedX + 1][board.selectedY].piece.moved = true;
                }else{
                  board.spaces[board.selectedX - 2][board.selectedY].piece.type = board.spaces[board.selectedX][board.selectedY].piece.type;
                  board.spaces[board.selectedX - 2][board.selectedY].piece.player = board.spaces[board.selectedX][board.selectedY].piece.player;
                  board.spaces[board.selectedX - 1][board.selectedY].piece.type = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.type;
                  board.spaces[board.selectedX - 1][board.selectedY].piece.player = board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.player;
                  board.spaces[board.selectedX - 2][board.selectedY].piece.moved = true;
                  board.spaces[board.selectedX - 1][board.selectedY].piece.moved = true;
                }

                board.spaces[board.selectedX][board.selectedY].piece.type = '';
                board.spaces[board.selectedX][board.selectedY].piece.player = 0;
                board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.type = '';
                board.spaces[board.spaces[board.selectedX][board.selectedY].moves[i].x][board.spaces[board.selectedX][board.selectedY].moves[i].y].piece.player = 0;

                moved = true;
              }
            }
          }
        }
      }
      if (moved == true){
        board.selectedX = -1;
        board.selectedY = -1;
        turn *= -1;
        board.whiteking.check = false;
        board.blackking.check = false;
        for (x = 0; x < board.x; x++){
          for (y = 0; y < board.y; y++){
            board.logic(x,y);
          }
        }
        data = {
          position: board.spaces,
          turn: turn,
        }
        socket.emit('endTurnChess', data);
      }
    }
    board.selectedX = floor(mouseX/k);
    board.selectedY = floor(mouseY/k);
  }
}
