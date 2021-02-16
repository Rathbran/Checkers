const fs = require("fs");

function OpenFile(){
  file = "./BoardState.txt"
  fs.readFile(file, 'utf-8',function (error, data){
    if (error) throw error;
    let items = data.splice(" ");
    for (x = 0; x < 10; x++){
      let items[x] = items[x].splice(",");
      for (y = 0; y < 10; y++){
        Board[x][y] = items[x][y];
      }
    }
  });
}

function SaveFile(){
  file = "./BoardState.txt"
  fs.unlinkSync(file);
  fs.open(file, 'w+', function(err, fd) {
    if (err) {
      return console.error(err);
    }
    let msg = "";
    for (x = 0; x < 10; x++){
      for (y = 0; y < 10; y++){
        msg = Board[x][y] + ",";
      }
      msg = msg + " "
    }
    console.log(msg);
    fs.write(fd, msg , function(err) {
      if (err) {
        console.log(err);
      }
    });
    fs.close(fd, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

var k = 30;

function selected() {
  this.x = 0;
  this.y = 0;
  this.plr = 0;
  this.Queen = 1;
}

var playing = false;
var Counter = -1;
var Turn = new selected();
var Board = [];
var Step = 1;
var Streak = new selected();
var Piece = 'white';

function setup() {
  createCanvas(k * 10 + k, k * 10);
  background('white');
  Play = createButton('-Play-');
  Play.position(k * 4.75, k * 4.5);
  Play.mouseClicked(StartGame);
}

function StartGame() {
  InitializeGame();
  Play.hide()
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
        stroke('rgba(10,10,100, 0.5)')
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
  } else if (Piece < 0) {
    fill('black');
    circle(Center(x), Center(y), k / 2);
  }
}

function Jump(Turn, origin) {
  let jump = new selected();
  jump.y = Turn.y + ((Turn.y - origin.y));
  jump.x = origin.x + 2 * (Turn.x - origin.x);
  if ((jump.x >= 0 && jump.x < 10) && (jump.y >= 0 && jump.y < 10)) {
    if (Board[jump.x][jump.y] == 0) {
      if (Step > 1) {
        if (Turn.plr / origin.plr < 0) {
          checkQueen(jump);
          Board[jump.x][jump.y] = origin.plr;
          Board[origin.x][origin.y] = 0;
          Streak = jump;
          print(Streak.plr);
          Board[Turn.x][Turn.y] = 0;
        }
      } else {
        Board[jump.x][jump.y] = origin.plr;
        Board[origin.x][origin.y] = 0;
        if (Turn.plr / origin.plr < 0) {
          Step++;
          Streak = jump;
          checkQueen(Streak);
          Board[Turn.x][Turn.y] = 0;
        }
      }
      return jump;
    }
  }
  Step = 1;
  return Turn;
}

function Logic(Turn, origin) {
  if ((Turn.y == origin.y + Counter || Turn.y == origin.y + (Counter * origin.Queen)) && (Turn.x == origin.x + 1 || Turn.x == origin.x - 1) && origin.plr * Counter > 0) {
    if (Turn.plr == 0) {
      if (Step > 1) {
        Step = 1
      } else {
        Board[origin.x][origin.y] = 0;
        Board[Turn.x][Turn.y] = origin.plr;
      }
    } else {
      Turn = Jump(Turn, origin);
    }
    if (Step == 1) {
      Counter = Counter * -1
    }
  }

  Turn.plr = Board[Turn.x][Turn.y];

}

function Move() {
  if (mouseIsPressed) {
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
  board(Piece);
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
    key = ""
  }
}

function draw() {
  if (playing == true) {
    OpenFile();
    keyPressed()
    Move();
    for (x = 0; x < 10; x++) {
      for (y = 0; y < 10; y++) {
        drawpiece(Board[x][y], x, y);
      }
    }
    drawpiece(Counter, 10, 0);
    SaveFile();
  }
  fill('green');
  circle(mouseX, mouseY, k / 3);
}
