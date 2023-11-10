const tileColors = ["tileblue", "tilegreen", "tilered"]
var rnd = new Srand();
var board;

function init() {
    board = document.getElementById("gameboard");
    var html = "";
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < 6; c++) {
            html += '<div></div>';
        }
    }
    board.innerHTML = html;
    newBoard();
}

function newBoard() {
    const squares = document.querySelectorAll("#gameboard > *");
    var idx = 0;
    for (var c1=0;c1<3;c1++) {
        for (var c2=0;c2<3;c2++) {
            for (var c3=0;c3<3;c3++) {
                squares[idx].innerHTML = '<img src="tiles/'+c1+''+c2+'.png"/>';
                squares[idx++].classList.add(tileColors[c3]);
            }
        }
    }
}