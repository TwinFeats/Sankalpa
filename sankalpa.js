const tileColors = ["tileblue", "tilegreen", "tilered"]
var rnd = new Srand();
var boardUI;
var board = [];
var pouch = [];
var handUI;
var hand = new Array(6);
var squares;
var total = 0;
var tileToPlay = null;
var seed = 0;

function init(gameseed) {
    if (gameseed) {
        seed = gameseed;
        rnd = new Srand(seed);
        history.replaceState(null, 'Sankalpa', 'https://twinfeats.com/sankalpa/?game='+seed);
        navigator.clipboard.writeText('https://twinfeats.com/sankalpa/?game='+seed);
        document.getElementById("game").innerHTML = seed;
    } else {
        var loc = window.location.search;
        var idx = loc.lastIndexOf("game=");
        if (idx >= 0) {
            gameseed = parseInt(loc.substring(idx+5));
        } else {
            gameseed = rnd.intInRange(1, 1000000000);
        }
        init(gameseed);
        return;
    }


    boardUI = document.getElementById("gameboard");
    var html = "";
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < 6; c++) {
            html += '<div id="square'+(r*10 + c)+'" ontouchstart="placeTileOnSquare(event)"></div>';
        }
    }
    boardUI.innerHTML = html;
    squares = document.querySelectorAll("#gameboard > *");
    var h = document.getElementById("hand");
    h.innerHTML = '<div></div><div></div><div></div><div></div><div></div><div class="tileback"><span id="count">45<span></div>';
    handUI = document.querySelectorAll("#hand > *");
    newBoard();
}

function newGame() {
    init(rnd.intInRange(1, 1000000000));
}

function newBoard() {
    pouch = [];
    for (var i=0;i<2;i++) {
        for (var c1=0;c1<3;c1++) {
            for (var c2=0;c2<3;c2++) {
                for (var c3=0;c3<3;c3++) {
                    pouch.push(new Tile(c1, c2, c3, "tile"+i+""+(c1*100 + c2*10 + c3)));
                }
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
    updateCount();
}


function updateCount() {
    document.getElementById("count").innerHTML = pouch.length;
}

function placeTile(tile, row, col) {
    var idx = row * 6 + col;
    squares[idx].innerHTML = '<img src="tiles/'+tile.symbol+''+tile.fg+'.png" id="'+tile.id+'">';
    squares[idx].classList.add(tileColors[tile.bg]);
}

function addToHand(tile, idx) {
    hand[idx] = tile;
    handUI[idx].innerHTML = '<img src="tiles/'+tile.symbol+''+tile.fg+'.png" ontouchstart="touchTile(event)" id="'+tile.id+'"/>';
    handUI[idx].className = "";
    handUI[idx].classList.add(tileColors[tile.bg]);
}

function touchTile(event) {
    if (tileToPlay != null) {
        tileToPlay.classList.remove("selected");
    }
    tileToPlay = null;
    var tile = find("#hand > *", event.touches[0].clientX, event.touches[0].clientY);
    if (tile != null) {
        tileToPlay = tile;
        tileToPlay.classList.toggle("selected");
        if (!tileToPlay.classList.contains("selected")) {
            tileToPlay = null;
        }
    }
}

function placeTileOnSquare(event) {
    if (tileToPlay != null) {
        var square = find("#gameboard > *", event.touches[0].clientX, event.touches[0].clientY);
        if (square != null) {
            if (document.querySelectorAll("#"+square.id > "img").length == 0) {
                var score = scorePlay(square);
                if (score > 0) {
                    goodPlay.play();
                    score = Math.pow(2, score-1);
                    var idx = -1;
                    var thehand = document.getElementById("hand");
                    if (thehand.children[1] == tileToPlay) idx = 1;
                    if (thehand.children[2] == tileToPlay) idx = 2;
                    if (thehand.children[3] == tileToPlay) idx = 3;
                    var tileimg = tileToPlay.firstElementChild;
                    tileToPlay.removeChild(tileimg);
                    var sq = document.getElementById(square.id);
                    sq.appendChild(tileimg);
                    sq.classList.add(tileToPlay.classList[0]);
                    tileToPlay.classList.remove("selected");

                    addToHand(pouch.pop(), idx);

                    tileToPlay = null;
                    total += score;
                    document.getElementById("score").innerHTML = total;
                    updateCount();
                    if (document.querySelectorAll("#gameboard img").length == 36) {
                        total += 50;
                    }
                } else {
                    badPlay.play();
                }
            }
        }
    }
}

function scorePlay(square) {
    var id = square.id.substring(6);
    var row = Math.floor(id / 10);
    var col = id % 10;
    var n = null;
    var s = null;
    var e = null;
    var w = null;
    var score = 0;
    if (row > 0) {
        n = document.getElementById("square"+((row-1)*10 + col));
        var nscore = scoreSquare(n);
        if (nscore == -1) return 0;
        score += nscore;
    }
    if (row < 5) {
        s = document.getElementById("square"+((row+1)*10 + col));
        var sscore = scoreSquare(s);
        if (sscore == -1) return 0;
        score += sscore;
    }
    if (col > 0) {
        w = document.getElementById("square"+(row*10 + (col-1)));
        var wscore = scoreSquare(w);
        if (wscore == -1) return 0;
        score += wscore;
    }
    if (col < 5) {
        e = document.getElementById("square"+(row*10 + (col+1)));
        var escore = scoreSquare(e);
        if (escore == -1) return 0;
        score += escore;
    }
    return score;
}

function scoreSquare(square) {
    var tile = tileToPlay.firstElementChild;
    var score = 0;
    var t = document.querySelector("#"+square.id+' > img');
    if (t != null) {
        var tid = parseInt(t.id.substring(5));
        var t1 = Math.floor(tid/100);
        var t2 = Math.floor((tid - t1*100)/10);
        var t3 = tid % 10;

        var tileid = parseInt(tile.id.substring(5));
        var tile1 = Math.floor(tileid/100);
        var tile2 = Math.floor((tileid - tile1*100)/10);
        var tile3 = tileid % 10;

        if (t1 == tile1) score++;
        if (t2 == tile2) score++;
        if (t3 == tile3) score++;
        if (score == 0) return -1;
        return score;
    }
    return 0;
}

function find(selector, x, y) {
    var tiles = document.querySelectorAll(selector);
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        var w = tile.clientWidth / 6;
        var h = tile.clientHeight / 6;
        if (x >= tile.offsetLeft + w && x < tile.offsetLeft + tile.clientWidth - w) {
            if (y >= tile.offsetTop + h && y < tile.offsetTop + tile.clientHeight - h) {
                return tile;
            }
        }
    }
    return null;
}

class Square {
    constructor(row, col, tile) {
        this.row = row;
        this.col = col;
        this.tile = tile;
    }
}

class Tile {
    constructor(symbol, fg, bg, id) {
        this.symbol = symbol;
        this.fg = fg;
        this.bg = bg;
        this.id = id;
    }
}