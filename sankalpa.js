const tileColors = ["tileblue", "tilegreen", "tilered"]
var rnd = new Srand();
var boardUI;
var board = [];
var pouch = [];
var handUI;
var hand = new Array(6);
var squares;
var score = 0;0

function init() {
    boardUI = document.getElementById("gameboard");
    var html = "";
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < 6; c++) {
            html += '<div></div>';
        }
    }
    boardUI.innerHTML = html;
    squares = document.querySelectorAll("#gameboard > *");
    var h = document.getElementById("hand");
    h.innerHTML = '<div></div><div></div><div></div><div></div><div></div><div class="tileback"></div>';
    handUI = document.querySelectorAll("#hand > *");
    newBoard();
}

function newBoard() {
    pouch = [];
    for (var c1=0;c1<3;c1++) {
        for (var c2=0;c2<3;c2++) {
            for (var c3=0;c3<3;c3++) {
                pouch.push(new Tile(c1, c2, c3));
            }
        }
    }

    for (var i=0;i<pouch.length;i++) {
        var i2 = rnd.intInRange(0, pouch.length-1);
        var t = pouch[i];
        pouch[i] = pouch[i2];
        pouch[i2] = t;
    }

    placeTile(pouch.pop(), 0, 0);
    placeTile(pouch.pop(), 0, 5);
    placeTile(pouch.pop(), 5, 0);
    placeTile(pouch.pop(), 5, 5);
    placeTile(pouch.pop(), 2, 2);
    placeTile(pouch.pop(), 3, 3);


    addToHand(pouch.pop(), 1);
    addToHand(pouch.pop(), 2);
    addToHand(pouch.pop(), 3);
}

function placeTile(tile, row, col) {
    var idx = row * 6 + col;
    squares[idx].innerHTML = '<img src="tiles/'+tile.symbol+''+tile.fg+'.png">';
    squares[idx].classList.add(tileColors[tile.bg]);
}

function addToHand(tile, idx) {
    hand[idx] = tile;
    handUI[idx].innerHTML = '<img src="tiles/'+tile.symbol+''+tile.fg+'.png">';
    handUI[idx].classList.add(tileColors[tile.bg]);
}

class Square {
    constructor(row, col, tile) {
        this.row = row;
        this.col = col;
        this.tile = tile;
    }
}

class Tile {
    constructor(symbol, fg, bg) {
        this.symbol = symbol;
        this.fg = fg;
        this.bg = bg;
    }
}