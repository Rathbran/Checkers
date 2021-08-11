//Declarations
var socket = io();
var sprites;

var k = 30;
var Player = '';
var move = false;
var turn = 'w';
var playing = true;

//Board Object
var Board = {
    width: 8,
    height: 8,

    selected: {
        x: 0,
        y: 0,
    },
    move: {
        x: 0,
        y: 0,
        Take: false,
        Castling: false,
    },

    Spaces: [],
    BlackPieces: 0,
    WhitePieces: 0,
    BlackCheck: false,
    WhiteCheck: false,
    BlackCheckMate: false,
    WhiteCheckMate: false,

    PopulatePieces: function () {
        for (var i in this.Spaces) {
            for (var j in this.Spaces[i]) {
                this.Spaces[i][j].Possession.Black = false
                this.Spaces[i][j].Possession.White = false
            }
        }
        for (i in this.BlackPieces) {
            this.Spaces[this.BlackPieces[i].x][this.BlackPieces[i].y].Piece.PopulateMoves();
        }
        for (i in this.WhitePieces) {
            this.Spaces[this.WhitePieces[i].x][this.WhitePieces[i].y].Piece.PopulateMoves();
        }
    },

    TakePiece: function () {
        if (turn == 'w') {
            var n = 0;
            while (this.BlackPieces[n].x != this.move.x || this.BlackPieces[n].y != this.move.y && n < this.BlackPieces.length) {
                n++;
            }
            //console.log(n);
            this.BlackPieces.splice(n, 1);
        } else if (turn == 'b') {
            let n = 0;
            while (this.WhitePieces[n].x != this.move.x || this.WhitePieces[n].y != this.move.y && n < this.WhitePieces.length) {
                n++;
            }
            //console.log(n);
            this.WhitePieces.splice(n, 1);
        }
    },

    MovePiece: function (x1,y1,x2,y2) {
        //switch selected piece into move slot and remove from selected slot
        this.Spaces[x2][y2].Piece.team = this.Spaces[x1][y1].Piece.team;
        this.Spaces[x2][y2].Piece.piece = this.Spaces[x1][y1].Piece.piece;
        this.Spaces[x2][y2].Piece.firstMove = false;
        this.Spaces[x1][y1].Piece.team = 'e';
        this.Spaces[x1][y1].Piece.piece = 'e';
        //update position in list of pieces
    },

    UpdateLists: function (x1,y1,x2,y2) {
        if (turn == 'w') {
            var piece = 0;
            for (n in this.WhitePieces) {
                if (this.WhitePieces[n].x == x1 && this.WhitePieces[n].y == y1) {
                    piece = n;
                }
            }
            this.WhitePieces[piece].x = x2;
            this.WhitePieces[piece].y = y2;
        } else if (turn == 'b') {
            var piece = 0;
            for (n in this.BlackPieces) {
                if (this.BlackPieces[n].x == x1 && this.BlackPieces[n].y == y1) {
                    piece = n;
                }
            }
            this.BlackPieces[piece].x = x2;
            this.BlackPieces[piece].y = y2;
        }
    },

    TurnChange: function () {
        //console.log(this.BlackCheck);
        //console.log(this.WhiteCheck);

        // will have to add complete exception for castling.
        // if taking, remove took piece from list of pieces
        if (this.move.Castling == true) {
            var direction = (this.selected.x - this.move.x) / abs(this.selected.x - this.move.x);
            //console.log(this.move.x + direction) //6
            //console.log(this.move.x - direction) //8
            this.MovePiece((this.move.x - direction), this.selected.y, (this.move.x + direction), this.move.y);
            this.UpdateLists((this.move.x - direction), this.selected.y, (this.move.x + direction), this.move.y);
        }
        if (this.move.Take == true) {
            this.TakePiece();
        }
        this.MovePiece(this.selected.x, this.selected.y,this.move.x, this.move.y);
        this.UpdateLists(this.selected.x, this.selected.y, this.move.x, this.move.y);

        if (move == true) {
            this.SendData()
        }

        //change turn
        this.selected.x = 0;
        this.selected.y = 0;
        this.move.x = 0;
        this.move.y = 0;
        this.move.Take = false;
        this.move.Castling = false;
        move = false;
        //Populate Moves 
        if (this.WhiteCheck == true) {
            this.WhiteCheckMate = true;
            this.WhiteCheck = false
        }
        if (this.BlackCheck == true) {
            this.BlackCheckMate = true;
            this.BlackCheck = false
        }
        this.PopulatePieces()
        if (this.WhiteCheck != true) {
            this.WhiteCheckMate = false;
        }
        if (this.BlackCheck != true) {
            this.BlackCheckMate = false;
        }

        if (this.BlackCheckMate == true || this.WhiteCheckMate == true) {
            playing = false;
        }
        if (turn == 'w') {
            turn = 'b';
        } else if (turn == 'b') {
            turn = 'w';
        }
        
    },

    SendData: function () {
        var data = {
            selected: {
                x: this.selected.x,
                y: this.selected.y,
            },
            move: {
                x: this.move.x,
                y: this.move.y,
                Take: this.move.Take,
                Castling: this.move.Castling,
            },
        }
        socket.emit('endTurnChess', data);
    },

    Initialize: function () {
        this.BlackPieces = [];
        this.WhitePieces = [];

        // initialize Board spaces.
        for (var x = 1; x <= this.width; x++) {
            this.Spaces[x] = [];
            for (var y = 1; y <= this.height; y++) {
                this.Spaces[x][y] = new Space(x,y);
            }
        }

        // initialize white back row
        var team = 'w';
        var y = 1;

        for (var x = 1; x <= this.width; x++) {
            this.Spaces[x][y].Piece.team = team;
        }
        this.Spaces[1][y].Piece.piece = 'r';
        this.Spaces[2][y].Piece.piece = 'k';
        this.Spaces[3][y].Piece.piece = 'b';
        this.Spaces[4][y].Piece.piece = 'Q';
        this.Spaces[5][y].Piece.piece = 'K';
        this.Spaces[6][y].Piece.piece = 'b';
        this.Spaces[7][y].Piece.piece = 'k';
        this.Spaces[8][y].Piece.piece = 'r';

        // initialize pawns
        for (var x = 1; x <= this.width; x++) {
            this.WhitePieces.push({
                x: x,
                y: 1,
            })
            this.WhitePieces.push({
                x: x,
                y: 2,
            })
            y = 2;
            this.Spaces[x][y].Piece.team = 'w'
            this.Spaces[x][y].Piece.piece = 'p'
            this.BlackPieces.push({
                x: x,
                y: 7,
            })
            this.BlackPieces.push({
                x: x,
                y: 8,
            })
            y = 7;
            this.Spaces[x][y].Piece.team = 'b'
            this.Spaces[x][y].Piece.piece = 'p'
        }
        // initialize black back row
        team = 'b'
        y = 8;
        for (var x = 1; x <= this.width; x++) {
            this.Spaces[x][y].Piece.team = team;
        }
        this.Spaces[1][y].Piece.piece = 'r';
        this.Spaces[2][y].Piece.piece = 'k';
        this.Spaces[3][y].Piece.piece = 'b';
        this.Spaces[4][y].Piece.piece = 'Q';
        this.Spaces[5][y].Piece.piece = 'K';
        this.Spaces[6][y].Piece.piece = 'b';
        this.Spaces[7][y].Piece.piece = 'k';
        this.Spaces[8][y].Piece.piece = 'r';

        if (turn == 'w') {
            for (i in this.WhitePieces) {
                this.Spaces[this.WhitePieces[i].x][this.WhitePieces[i].y].Piece.PopulateMoves();
            }
        } else if (turn == 'b') {
            for (i in this.BlackPieces) {
                this.Spaces[this.BlackPieces[i].x][this.BlackPieces[i].y].Piece.PopulateMoves();
            }
        }
    },

    Display: function () {
        stroke('black')
        for (var x = 1; x <= this.width; x++) {
            for (var y = 1; y <= this.height; y++) {
                if ((y + x) % 2 == 0) {
                    fill(0, 0, 0, 100)
                } else { fill(255, 255, 255, 100) }
                square(x * k, y * k, k)
            }
        }
        for (var i in this.BlackPieces) {
        //    highlight(this.BlackPieces[i].x, this.BlackPieces[i].y, 'purple');
            this.Spaces[this.BlackPieces[i].x][this.BlackPieces[i].y].Piece.display();
        }
        for (var i in this.WhitePieces) {
        //    highlight(this.WhitePieces[i].x, this.WhitePieces[i].y, 'teal');
            this.Spaces[this.WhitePieces[i].x][this.WhitePieces[i].y].Piece.display();
        }
        if (this.selected.x != 0 && this.selected.y != 0) {
            //console.log(this.Spaces[this.selected.x][this.selected.y].Piece.Moves.length)
            //for (var i in this.Spaces[this.selected.x][this.selected.y].Piece.Moves) {
            //    highlight(this.Spaces[this.selected.x][this.selected.y].Piece.Moves[i].x, this.Spaces[this.selected.x][this.selected.y].Piece.Moves[i].y, 'green')
            //}
            //console.log(this.Spaces[this.selected.x][this.selected.y].Piece.Takes.length)
            //for (var i in this.Spaces[this.selected.x][this.selected.y].Piece.Takes) {
            //    highlight(this.Spaces[this.selected.x][this.selected.y].Piece.Takes[i].x, this.Spaces[this.selected.x][this.selected.y].Piece.Takes[i].y, 'red')
            //}
            //for (var i in this.Spaces[this.selected.x][this.selected.y].Piece.Castling) {
            //    highlight(this.Spaces[this.selected.x][this.selected.y].Piece.Castling[i].x, this.Spaces[this.selected.x][this.selected.y].Piece.Castling[i].y, 'gold')
            //}
            //for (var i in this.Spaces) {
            //    for (var j in this.Spaces[i]) {
            //        if (this.Spaces[i][j].Possession.Black == true) {
            //            highlight(i, j, 'black')
            //        }
            //        if (this.Spaces[i][j].Possession.White == true) {
            //            highlight(i, j, 'white')
            //        }
            //    }
            //}
        }

    },

};

function Space(x,y) {
    this.Piece = new Piece('e','e',x,y);
    this.Possession = {
        Black: false,
        White: false,
    };
}

function Piece(Team, Piece, x, y) {
    this.team = Team;
    this.piece = Piece;
    this.Moves = [];
    this.Takes = [];
    this.Castling = [];
    this.firstMove = true;
    this.Position = {
        x: x,
        y: y,
    };


    this.checkTake = function (dx, dy) {
        var x = this.Position.x + dx;
        var y = this.Position.y + dy;
        if (x >= 1 && x <= 8 && y >= 1 && y <= 8) {
            this.TakePossession(x, y);
            if (Board.Spaces[x][y].Piece.piece != 'e' && Board.Spaces[x][y].Piece.team != this.team) {
                if (Board.Spaces[x][y].Piece.piece == 'K') {
                    if (this.team == 'w') {
                        Board.BlackCheck = true;
                    } else if (this.team == 'b') {
                        Board.WhiteCheck = true;
                    }
                }
                this.Takes.push({
                    x: x,
                    y: y,
                })
            }
        }
    };

    this.checkMove = function (dx, dy) {
        var x = this.Position.x + dx;
        var y = this.Position.y + dy;
        if (x >= 1 && x <= 8 && y >= 1 && y <= 8) {
            if (Board.Spaces[x][y].Piece.piece == 'e') {
                this.Moves.push({
                    x: x,
                    y: y,
                })
            }
        }
    };

    this.checkDirection = function (dx, dy) {
        var x = this.Position.x + dx;
        var y = this.Position.y + dy;
        while (x >= 1 && x <= 8 && y >= 1 && y <= 8) {
            if (Board.Spaces[x][y].Piece.piece == 'e') {
                this.Moves.push({
                    x: x,
                    y: y,
                })
                this.TakePossession(x,y);
            } else { break }
            x += dx;
            y += dy;
        }
        this.checkTake(x - this.Position.x, y - this.Position.y);
    };


    this.PopulateMoves = function () {
        this.Moves.pop(this.Moves.length);
        this.Takes.pop(this.Takes.length);
        this.Castling.pop(this.Castling.length)

        switch (this.piece) {
            case 'r':
                //check LEFT
                this.checkDirection(-1, 0)
                //check RIGHT
                this.checkDirection(1, 0)
                //check UP
                this.checkDirection(0, -1)
                //check DOWN
                this.checkDirection(0, 1)
                break;
            case 'k':
                this.checkMove(2, 1)
                this.checkTake(2, 1)
                this.checkMove(-2, 1)
                this.checkTake(-2, 1)
                this.checkMove(2, -1)
                this.checkTake(2, -1)
                this.checkMove(-2, -1)
                this.checkTake(-2, -1)
                this.checkMove(1, 2)
                this.checkTake(1, 2)
                this.checkMove(-1, 2)
                this.checkTake(-1, 2)
                this.checkMove(1, -2)
                this.checkTake(1, -2)
                this.checkMove(-1, -2)
                this.checkTake(-1, -2)
                break;
            case 'b':
                //check LEFT UP
                this.checkDirection(-1, -1)
                //check RIGHT UP
                this.checkDirection(1, -1)
                //check LEFT DOWN
                this.checkDirection(-1, 1)
                //check RIGHT DOWN
                this.checkDirection(1, 1)
                break;
            case 'Q':
                //check LEFT
                this.checkDirection(-1, 0)
                //check RIGHT
                this.checkDirection(1, 0)
                //check UP
                this.checkDirection(0, -1)
                //check DOWN
                this.checkDirection(0, 1)
                //check LEFT UP
                this.checkDirection(-1, -1)
                //check RIGHT UP
                this.checkDirection(1, -1)
                //check LEFT DOWN
                this.checkDirection(-1, 1)
                //check RIGHT DOWN
                this.checkDirection(1, 1)
                break;
            case 'K':
                for (var x = -1; x <= 1; x++) {
                    for (var y = -1; y <= 1; y++) {
                        if (this.Position.x + x >= 1 && this.Position.x + x <= 8 && this.Position.y + y >= 1 && this.Position.y + y <= 8) {
                            if ((this.team == 'w' && Board.Spaces[this.Position.x + x][this.Position.y + y].Possession.Black == false) || (this.team == 'b' && Board.Spaces[this.Position.x + x][this.Position.y + y].Possession.White == false)) {
                                this.checkMove(x, y);
                                this.checkTake(x, y);
                            }
                        }
                    }
                }
                if (this.firstMove == true) {
                    //castling.
                    if (this.team == 'w') {
                        if (Board.WhiteCheck == false) {
                            if (Board.Spaces[this.Position.x - 1][this.Position.y].Possession.Black == false && Board.Spaces[this.Position.x - 1][this.Position.y].Piece.piece == 'e') {
                                if (Board.Spaces[this.Position.x - 2][this.Position.y].Possession.Black == false && Board.Spaces[this.Position.x - 2][this.Position.y].Piece.piece == 'e') {
                                    if (Board.Spaces[this.Position.x - 3][this.Position.y].Possession.Black == false && Board.Spaces[this.Position.x - 3][this.Position.y].Piece.piece == 'e') {
                                        if (Board.Spaces[this.Position.x - 4][this.Position.y].Piece.firstMove == true) {
                                            this.Castling.push({
                                                x: this.Position.x - 2,
                                                y: this.Position.y,
                                            })
                                        }
                                    }
                                }
                            }
                            if (Board.Spaces[this.Position.x + 1][this.Position.y].Possession.Black == false && Board.Spaces[this.Position.x + 1][this.Position.y].Piece.piece == 'e') {
                                if (Board.Spaces[this.Position.x + 2][this.Position.y].Possession.Black == false && Board.Spaces[this.Position.x + 2][this.Position.y].Piece.piece == 'e') {
                                    if (Board.Spaces[this.Position.x + 3][this.Position.y].Piece.firstMove == true) {
                                        this.Castling.push({
                                            x: this.Position.x + 2,
                                            y: this.Position.y,
                                        })
                                    }
                                }
                            }
                        }
                    } else if (this.team == 'b') {
                        if (Board.BlackCheck == false) {
                            if (Board.Spaces[this.Position.x - 1][this.Position.y].Possession.White == false && Board.Spaces[this.Position.x - 1][this.Position.y].Piece.piece == 'e') {
                                if (Board.Spaces[this.Position.x - 2][this.Position.y].Possession.White == false && Board.Spaces[this.Position.x - 2][this.Position.y].Piece.piece == 'e') {
                                    if (Board.Spaces[this.Position.x - 3][this.Position.y].Possession.White == false && Board.Spaces[this.Position.x - 3][this.Position.y].Piece.piece == 'e') {
                                        if (Board.Spaces[this.Position.x - 4][this.Position.y].Piece.firstMove == true) {
                                            this.Castling.push({
                                                x: this.Position.x - 2,
                                                y: this.Position.y,
                                            })
                                        }
                                    }
                                }
                            }
                            if (Board.Spaces[this.Position.x + 1][this.Position.y].Possession.White == false && Board.Spaces[this.Position.x + 1][this.Position.y].Piece.piece == 'e') {
                                if (Board.Spaces[this.Position.x + 2][this.Position.y].Possession.White == false && Board.Spaces[this.Position.x + 2][this.Position.y].Piece.piece == 'e') {
                                    if (Board.Spaces[this.Position.x + 3][this.Position.y].Piece.firstMove == true) {
                                        this.Castling.push({
                                            x: this.Position.x + 2,
                                            y: this.Position.y,
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            case 'p':
                //check Forewards.
                if (this.team == 'w') {
                    this.checkMove(0, 1);
                    this.checkTake(1, 1);
                    this.checkTake(-1, 1);
                    if (this.firstMove == true) {
                        this.checkMove(0, 2);
                    }
                } else if (this.team == 'b') {
                    this.checkMove(0, -1);
                    this.checkTake(1, -1);
                    this.checkTake(-1, -1);
                    if (this.firstMove == true) {
                        this.checkMove(0, -2);
                    }
                }
                break;
        }

    };

    this.TakePossession = function (x,y) {
        if (this.team == 'b') {
            Board.Spaces[x][y].Possession.Black = true;
        }
        if (this.team == 'w') {
            Board.Spaces[x][y].Possession.White = true;
        }
    };

    this.display = function () {
        //piece sprite
        switch (this.piece) {
            case 'p':
                if (this.team == 'w') {
                    image(sprites.pawnW, this.Position.x * k, this.Position.y * k);
                } else if (this.team == 'b') {
                    image(sprites.pawnB, this.Position.x * k, this.Position.y * k);
                }
                break;
            case 'r':
                if (this.team == 'w') {
                    image(sprites.rookW, this.Position.x * k, this.Position.y * k);
                } else if (this.team == 'b') {
                    image(sprites.rookB, this.Position.x * k, this.Position.y * k);
                }
                break;
            case 'k':
                if (this.team == 'w') {
                    image(sprites.knightW, this.Position.x * k, this.Position.y * k);
                } else if (this.team == 'b') {
                    image(sprites.knightB, this.Position.x * k, this.Position.y * k);
                }
                break;
            case 'b':
                if (this.team == 'w') {
                    image(sprites.bishopW, this.Position.x * k, this.Position.y * k);
                } else if (this.team == 'b') {
                    image(sprites.bishopB, this.Position.x * k, this.Position.y * k);
                }
                break;
            case 'Q':
                if (this.team == 'w') {
                    image(sprites.queenW, this.Position.x * k, this.Position.y * k);
                } else if (this.team == 'b') {
                    image(sprites.queenB, this.Position.x * k, this.Position.y * k);
                }
                break;
            case 'K':
                if (this.team == 'w') {
                    image(sprites.kingW, this.Position.x * k, this.Position.y * k);
                } else if (this.team == 'b') {
                    image(sprites.kingB, this.Position.x * k, this.Position.y * k);
                }
                break;
        }
    };
}

function Center(i) {
    return i * k + k / 2;
}

function highlight(x, y, color) {
    noFill();
    stroke(color);
    square(x * k, y * k, k);
    noStroke();
}

function preload() {
    //Piece Sprites
    sprites = {
        bishopB: loadImage('../Sprites/Chess/BishopB.png'),
        bishopW: loadImage('../Sprites/Chess/BishopW.png'),
        rookB: loadImage('../Sprites/Chess/RookB.png'),
        rookW: loadImage('../Sprites/Chess/RookW.png'),
        kingB: loadImage('../Sprites/Chess/KingB.png'),
        kingW: loadImage('../Sprites/Chess/KingW.png'),
        queenB: loadImage('../Sprites/Chess/QueenB.png'),
        queenW: loadImage('../Sprites/Chess/QueenW.png'),
        knightB: loadImage('../Sprites/Chess/KnightB.png'),
        knightW: loadImage('../Sprites/Chess/KnightW.png'),
        pawnB: loadImage('../Sprites/Chess/PawnB.png'),
        pawnW: loadImage('../Sprites/Chess/PawnW.png'),
    }
}

function StartGame(data) {
    console.log('ye');
    Board.Initialize();
    
    Player = '';
    turn = 'w';
    playing = true;

}

function OpenFile(data) {
    //console.log(data)
    Board.selected.x = data.selected.x;
    Board.selected.y = data.selected.y;
    Board.move.x = data.move.x;
    Board.move.y = data.move.y;
    Board.move.Take = data.move.Take;
    Board.move.Castling = data.move.Castling;

    if (turn != Player) {
        Board.TurnChange();
    }
}

function setup() {
    createCanvas(k * 11, k * 10);

    //var server = 'https://bcae0f017e6c.ngrok.io';
    var server = 'http://localhost:3000'

    socket = io.connect(server)
    socket.emit('game', "Chess");
    socket.on('Chessturn', OpenFile);
    socket.on('newGame', StartGame);

    sprites.bishopB.resize(k, 0);
    sprites.bishopW.resize(k, 0);
    sprites.rookB.resize(k, 0);
    sprites.rookW.resize(k, 0);
    sprites.kingB.resize(k, 0);
    sprites.kingW.resize(k, 0);
    sprites.queenB.resize(k, 0);
    sprites.queenW.resize(k, 0);
    sprites.knightB.resize(k, 0);
    sprites.knightW.resize(k, 0);
    sprites.pawnB.resize(k, 0);
    sprites.pawnW.resize(k, 0);

    playing = false;

}

function draw() {
    background(130);
    if (playing == true) {
        selector(mouseX, mouseY, 'white');
        Board.Display();

        if (Board.move.x != 0 && Board.move.y != 0) {
            Board.TurnChange();
        }

        highlight(Board.selected.x, Board.selected.y, 'yellow')

        if (turn == 'w') {
            fill('white');
        } else {
            fill('black');
        }

        circle(10 * (k), k, k);
        if (Player != 'b') {
            image(sprites.kingW, 9.5 * k, 1.5 * k);
        }
        if (Player != 'w') {
            image(sprites.kingB, 9.5 * k, 2.5 * k);
        }
    }
}

function selector(x, y, color) {
    fill(color);
    circle(x, y, k / 4);
}

function keyPressed() {
    if (key == 'p') {
        socket.emit('startNewGame');
        console.log('playing')
    }
}

function mousePressed() {
    if (mouseX >= 9.5 * k && mouseX < 10.5 * k && mouseY >= 1.5 * k && mouseY < 2.5 * k && Player == '') {
        Player = 'w';
    } else if (mouseX >= 9.5 * k && mouseX < 10.5 * k && mouseY >= 2.5 * k && mouseY < 3.5 * k && Player == '') {
        Player = 'b';
    }
    if (mouseX >= k && mouseX <= k * (Board.width + 1)) {
        if (mouseY >= k && mouseY <= k * (Board.height + 1)) {
            //selecting pieces
            if (turn == 'w' && Player == 'w') {
                for (i in Board.WhitePieces) {
                    if (floor(mouseX / k) == Board.WhitePieces[i].x && floor(mouseY / k) == Board.WhitePieces[i].y) {
                        Board.selected.x = floor(mouseX / k);
                        Board.selected.y = floor(mouseY / k);
                        Board.move.x = 0;
                        Board.move.y = 0;
                    }
                }
            }
            if (turn == 'b' && Player == 'b') {
                for (i in Board.BlackPieces) {
                    if (floor(mouseX / k) == Board.BlackPieces[i].x && floor(mouseY / k) == Board.BlackPieces[i].y) {
                        Board.selected.x = floor(mouseX / k);
                        Board.selected.y = floor(mouseY / k);
                        Board.move.x = 0;
                        Board.move.y = 0;
                    }
                }
            }
            //selecting Moves
            if (Board.selected.x != 0 && Board.selected.y != 0) {
                // moves
                // Castling
                if (Board.Spaces[Board.selected.x][Board.selected.y].Piece.Castling.length > 0) {
                    for (i in Board.Spaces[Board.selected.x][Board.selected.y].Piece.Castling) {
                        if (floor(mouseX / k) == Board.Spaces[Board.selected.x][Board.selected.y].Piece.Castling[i].x && floor(mouseY / k) == Board.Spaces[Board.selected.x][Board.selected.y].Piece.Castling[i].y) {
                            Board.move.x = floor(mouseX / k);
                            Board.move.y = floor(mouseY / k);
                            Board.move.Castling = true;
                            move = true;
                        }
                    }
                }
                if (Board.Spaces[Board.selected.x][Board.selected.y].Piece.Moves.length > 0) {
                    for (i in Board.Spaces[Board.selected.x][Board.selected.y].Piece.Moves) {
                        if (floor(mouseX / k) == Board.Spaces[Board.selected.x][Board.selected.y].Piece.Moves[i].x && floor(mouseY / k) == Board.Spaces[Board.selected.x][Board.selected.y].Piece.Moves[i].y) {
                            Board.move.x = floor(mouseX / k);
                            Board.move.y = floor(mouseY / k);
                            move = true;
                        }
                    }
                }
                // takes
                if (Board.Spaces[Board.selected.x][Board.selected.y].Piece.Takes.length > 0) {
                    for (i in Board.Spaces[Board.selected.x][Board.selected.y].Piece.Takes) {
                        if (floor(mouseX / k) == Board.Spaces[Board.selected.x][Board.selected.y].Piece.Takes[i].x && floor(mouseY / k) == Board.Spaces[Board.selected.x][Board.selected.y].Piece.Takes[i].y) {
                            Board.move.x = floor(mouseX / k);
                            Board.move.y = floor(mouseY / k);
                            Board.move.Take = true;
                            move = true;
                        }
                    }
                }
            }
        }
    }
}
