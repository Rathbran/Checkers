var screen_size = 400;
var Speed = 500;
var Score = 0;
var LastCall;
var Playing = true;

function setup(){
    createCanvas(screen_size/2, screen_size);
    background(220);
    strokeWeight(0.125);
    Board.Constructor();
    Board.Block.Build();
    Board.Draw();
    LastCall = millis() - 3000;
}

function draw() {
  if (Playing = true){
    delay(Speed);
    Board.Draw();
  }
}

function delay(ms) {
    var timeElapsed = millis() - LastCall;

    if (timeElapsed > ms){
      Board.Block.Gravity();

      LastCall = millis();
    }
}

var Board = {
    Spaces : [],
    Size: 15,
    Block : new Block,
    Width: 10,
    Height: 22,

    RowSpot: function () {
      var Clear = true;
      for (var j = this.Height - 1; j > 1; j--){
        Clear = true;
        for(var i = 0; i < this.Width; i++){
          if (this.Spaces[i][j].color == 'white'){
            Clear = false;
          }
        }
        if (Clear == true){
          this.RowClear(j);
          j++;
        }
      }
    },

    RowClear: function (Row) {
      for (var j = Row; j > 1; j--){
        for(var i = 0; i < this.Width; i++){
            this.Spaces[i][j].color = this.Spaces[i][j-1].color;
        }
      }
      Score += 100;
      Speed = 500 / (floor(Score/1000) + 1);
    },

    Spot: function (Color) {
        for (var i in this.Block.Location) {
            this.Spaces[this.Block.Location[i].x][this.Block.Location[i].y].color = Color;
        }
    },

    Draw: function () {
        for (i in this.Spaces){
            for (var j = 2; j < this.Height; j++) {
                fill(this.Spaces[i][j].color);
                square(i * this.Size + this.Size, j * this.Size - this.Size, this.Size);
            }
        }
    },

    Constructor: function () {
        this.Spaces = [];
        for (var i = 0; i < this.Width; i++) {
            this.Spaces[i] = [];
            for (var j = 0; j < this.Height; j++) {
                this.Spaces[i].push(new Space);
            }
        }
    },
}

function Space() {
    this.color = "white";
}

function Block() {
    this.color = "red";
    this.Location = [];

    this.Rotate = function () {
      var test = [];
      var Turn = true;
      Board.Spot('white');
      for (var i in this.Location) {
        test[i] = {
          x: this.Location[i].x,
          y: this.Location[i].y,
        };
        var dY = this.Location[2].y - test[i].y;
        var dX = this.Location[2].x - test[i].x;
        this.Location[i].y = -1 * dX + this.Location[2].y;

        this.Location[i].x = dY + this.Location[2].x;

        if (this.Location[i].x < 10 && this.Location[i].x >= 0 && this.Location[i].y < 22 && this.Location[i].y >= 0) {
            if (Board.Spaces[this.Location[i].x][this.Location[i].y].color != 'white') {
                Turn = false;
            }
        } else {
            Turn = false;
        }
      }
      if (Turn == false){
        for (var i in this.Location) {
          this.Location[i].y = test[i].y;
          this.Location[i].x = test[i].x;
        }
      }
      Board.Spot(this.color)
    };

    this.Move = function (direction) {
        var Move = true;
        Board.Spot('white');
        for (var i in this.Location) {
            this.Location[i].x += direction;
            if (this.Location[i].x < 10 && this.Location[i].x >= 0) {
                if (Board.Spaces[this.Location[i].x][this.Location[i].y].color != 'white') {
                    Move = false;
                }
            } else {
                Move = false;
            }
        }
        if (Move == false) {
            for (var i in this.Location) {
                this.Location[i].x -= direction;
            }
        }
        Board.Spot(this.color);
    };

    this.Gravity = function () {
        var Move = true;
        Board.Spot('white');
        for (var i in this.Location) {
            this.Location[i].y++;
            if (this.Location[i].y < 22) {
                //console.log(this.Location[i].y)
                if (Board.Spaces[this.Location[i].x][this.Location[i].y].color != 'white') {
                    Move = false;
                }
            } else {
                Move = false;
            }
        }
        if (Move == false){
            for (var i in this.Location) {
                this.Location[i].y--;
            }
            Board.Spot(this.color);
            Board.RowSpot();
            Board.Block.Build();
        }
        Board.Spot(this.color);
        return Move;
    };

    this.Build = function () {
      // Make all the different blocks. going to be very tedius.
      for (var i = 0; i < 10; i++){
        for (var j = 0; j < 2; j++){
          if (Board.Spaces[i][j].color != 'white') {
              Playing = false;
          }
        }
      }

      Piece = floor(random() * 7) + 1;
        switch (Piece) {
          case 1://'line':
                for (var i = 0; i < 4; i++) {
                  this.Location[i] = {
                      x: i+4,
                      y: 0,
                  };
                }
                this.color = "Purple";
          break;
          case 2://'t':
                this.Location[0] = {
                    x: 4,
                    y: 1,
                };
                this.Location[1] = {
                    x: 5,
                    y: 0,
                };
                this.Location[2] = {
                    x: 5,
                    y: 1,
                };
                this.Location[3] = {
                    x: 6,
                    y: 1,
                };
                this.color = 'pink';
          break;
          case 3://'zRight':
                this.Location[0] = {
                    x: 4,
                    y: 1,
                };
                this.Location[1] = {
                    x: 5,
                    y: 0,
                };
                this.Location[2] = {
                    x: 5,
                    y: 1,
                };
                this.Location[3] = {
                    x: 6,
                    y: 0,
                };
                this.color = 'DarkRed';
          break;
          case 4://'zLeft':
                  this.Location[0] = {
                      x: 4,
                      y: 0,
                  };
                  this.Location[1] = {
                      x: 5,
                      y: 0,
                  };
                  this.Location[2] = {
                      x: 5,
                      y: 1,
                  };
                  this.Location[3] = {
                      x: 6,
                      y: 1,
                  };
                  this.color = 'Red';
          break;
          case 5://'square':
                    this.Location[0] = {
                        x: 4,
                        y: 1,
                    };
                    this.Location[1] = {
                        x: 5,
                        y: 1,
                    };
                    this.Location[2] = {
                        x: 5,
                        y: 0,
                    };
                    this.Location[3] = {
                        x: 4,
                        y: 0,
                    };
                    this.color = 'Green';
          break;
          case 6://'LRight':
                      this.Location[0] = {
                          x: 4,
                          y: 0,
                      };
                      this.Location[1] = {
                          x: 4,
                          y: 1,
                      };
                      this.Location[2] = {
                          x: 5,
                          y: 1,
                      };
                      this.Location[3] = {
                          x: 6,
                          y: 1,
                      };
                      this.color = 'Blue';
          break;
          case 7://'Lleft':
                        this.Location[0] = {
                            x: 4,
                            y: 1,
                        };
                        this.Location[1] = {
                            x: 6,
                            y: 1,
                        };
                        this.Location[2] = {
                            x: 5,
                            y: 1,
                        };
                        this.Location[3] = {
                            x: 6,
                            y: 0,
                        };
                        this.color = 'LightBlue';
          break;
        }
    };
}

function keyPressed() {
    if (keyIsDown(LEFT_ARROW)) {
        Board.Block.Move(-1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        Board.Block.Move(1);
    }
    if (keyIsDown(DOWN_ARROW)) {
        Board.Block.Gravity();
    }
    if (keyIsDown(UP_ARROW)) {
        Board.Block.Rotate();
    }
    if (key == " ") {
        Collision = true
        while (Collision == true){
          Collision = Board.Block.Gravity();
        }
    }
    if (key == 'p') {
      Board.Constructor();
      Board.Block.Build();
      Board.Draw();
      LastCall = millis() - 3000;
      Playing = true;
    }
}
