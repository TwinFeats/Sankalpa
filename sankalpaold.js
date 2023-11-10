var colors = ["blue","gray","green","red"];
var game = function(presetTiles) {
  var tilesStarting = 64;
  var board = new Array(8);
  var tiles = [];
  if (typeof(presetTiles) !== 'undefined' && presetTiles !== null) {
    tiles = presetTiles;
  }
  
  function countMatches(row, col, tile) {
    var matches = 0;
    var b1 = board[row][col].substr(0,1); 
    var b2 = board[row][col].substr(1,1); 
    var b3 = board[row][col].substr(2,1); 
    var t1 = tile.substr(0,1); 
    var t2 = tile.substr(1,1); 
    var t3 = tile.substr(2,1);
    if (b1 == t1) matches++;
    if (b2 == t2) matches++;
    if (b3 == t3) matches++;
    return matches;
  }
  
  return {
    // min and max are inclusive
    random: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    getTiles: function() {
      return tiles;
    },
    
    getBoard: function() {
      var b = "";
      var r,c;
      for (r=0;r<8;r++) {
        for (c=0;c<8;c++) {
          if (typeof(board[r][c]) !== 'undefined') {
            b += board[r][c]+";";
          }
          else {
            b += "-;";
          }
        }
      }
      return b;
    },
    
    getRemainingTilesCount: function() {
      return tiles.length;
    },
    
    getRemainingTilesPercentage: function() {
      return tiles.length/tilesStarting;
    },
    
    popTile: function() {
      return tiles.pop();
    },
    
    pushTile: function(tile) {
      tiles.push(tile);
    },
    
    validateAndScorePlay: function(row, col, tile) {
      var score = 0;
      var s = 0;
      if (row > 0) {
        if (typeof(board[row-1][col]) !== 'undefined' && board[row-1][col] !== null) {
          s = countMatches(row-1, col, tile);
          if (s > 0) {
            score += s;
          }
          else return 0;
        }
      }
      if (row < 7) {
        if (typeof(board[row+1][col]) !== 'undefined' && board[row+1][col] !== null) {
          s = countMatches(row+1, col, tile);
          if (s > 0) {
            score += s;
          }
          else return 0;
        }
      }
      if (col > 0) {
        if (typeof(board[row][col-1]) !== 'undefined' && board[row][col-1] !== null) {
          s = countMatches(row, col-1, tile);
          if (s > 0) {
            score += s;
          }
          else return 0;
        }
      }
      if (col < 7) {
        if (typeof(board[row][col+1]) !== 'undefined' && board[row][col+1] !== null) {
          s = countMatches(row, col+1, tile);
          if (s > 0) {
            score += s;
          }
          else return 0;
        }
      }
      if (score === 0) return 0;
      return Math.pow(2,(score-1));
    },
    
    hasTile: function(id, row, col) {
      return board[row][col] !== undefined && board[row][col] !== null;
    },
    
    placeTile: function(id, row, col, tile, tilesize) {
      var ts = tilesize;
      if (tilesize === undefined) {
        ts = 64;
      }
      board[row][col] = tile;
      $(id).append('<div class="tile tile'+colors[tile.substr(2,1)]+'" id="tile'+row.toString()+col.toString()+'"><img src="tiles/'+tile.substr(0,2)+'.png"/></div>');
      $(id+" div:last").css("top",row*ts+"px").css("left",col*ts+"px");
    },
    
    unplaceTile: function(id, row, col, tile, drawnTile) {
      board[row][col] = null;
      $("#tile"+row.toString()+col.toString()).remove();
      player.getHand().splice(2,1);
      $("#blank").remove();
      tiles.push(drawnTile);
      tiles.push(tile);
      player.drawTile();
      player.renderHand();
      player.addScore(-lastTile.score);
      lastTile = null;
    },

    createBoard: function() {
      var r;
      for (r=0;r<8;r++) {
        board[r] = new Array(8);
      }
    },
    
    init: function() {
      var r,c,i,n,t;
      for (r=0;r<4;r++) {
        for (c=0;c<4;c++) {
          for (i=0;i<4;i++) {
            tiles.push(r.toString()+c.toString()+i.toString());
          }
        }
      }
      for (i=0;i<tiles.length;i++) {
        n = this.random(0,tiles.length-1);
        t = tiles[i];
        tiles[i] = tiles[n];
        tiles[n] = t;
      }
    },

    initBoard: function(id) {
      this.placeTile(id,2,2,this.popTile());
      this.placeTile(id,2,5,this.popTile());
      this.placeTile(id,5,2,this.popTile());
      this.placeTile(id,5,5,this.popTile());
      
    },
    
    showGrid: function() {
      $("#board").addClass("grid");
    },

    hideGrid: function() {
      $("#board").removeClass("grid");
    }
  };
};