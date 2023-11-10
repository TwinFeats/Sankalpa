/* jshint maxerr: 1000 */
var options = {audio: true, helper: false, handSize: 3, time: 1800};

var players = [];
var player;
var sankalpa;
var premium = false;
var email = null;
var lastTile = null;

var aplayer = function() {
  var idx = players.length;
  var score = 0;
  var email = null;
  var secs = 300;
  var hand = [];
  function dragging(event, ui) {
    var col = Math.floor(ui.offset.left/64);
    var x = col*64;
    var row = Math.floor(ui.offset.top/64);
    var y = row*64;
    if (x >= 0 && x < 64*8 && y >= 0 && y < 64*8) {

      if (!options.helper || sankalpa.validateAndScorePlay(row,col,$(ui.helper).attr("id"))>0 && !sankalpa.hasTile("#board",row,col)) {
        $("#drophilight").css({left: x,top: y}).show();
      }
      else {
        $("#drophilight").hide();
      }
    }
    else {
      $("#drophilight").hide();
    }
  }
  
  function replaceBack() {
    $("#tileback").on("webkitTransitionEnd", function(e) {
      $("#blank").remove();
      hand.splice(2,1);
  //    player.drawTile();
      player.getHand().push(lastTile.drawnTile);
      player.renderHand();
      lastTile = null;
      $("#tilesRemaining").css({"height":(sankalpa.getRemainingTilesPercentage()*100).toString()+"%"});
      $("#tilesRemainingCounter").empty().append(sankalpa.getRemainingTilesCount());
    });
    $("#tileback").css("transform","rotateY(180deg)");
  }
  
  return {
    init: function() {
      hand = [];
      score = 0;
    },
    
    initHand: function() {
      var i;
      for (i=0;i<options.handSize;i++) {
        this.drawTile();
      }    
    },
    
    getHandCount: function() {
      return hand.length;
    },
    
    getHand: function() {
      return hand;
    },
    
    getScore: function() {
      return score;
    },
    
    getEmail: function() {
      return email;
    },
    
    setEmail: function(v) {
      email = v;
    },
    
    addScore: function(v) {
      score += v;
      renderScore(score);
    },
    
    removeTile: function(tile) {
      var i;
      for (i=0;i<hand.length;i++) {
        if (hand[i] == tile) {
          hand.splice(i,1);
          break;
        }
      }
    },
    
    drawTile: function() {
      var tile = sankalpa.popTile();
      if (tile !== undefined) {
        hand.push(tile);
        $("#tilesRemaining").css({"height":(sankalpa.getRemainingTilesPercentage()*100).toString()+"%"});
        $("#tilesRemainingCounter").empty().append(sankalpa.getRemainingTilesCount());
      }
    },
    
    renderHand: function() {
      var i,t;
      $("#hand").empty();
      for (i=0;i<hand.length;i++) {
        if (hand[i] == -1) {
          t = '<div id="tilebackcontainer"><div id="tileback"><div id="blank" class="tile back tileback"></div>';
          t += '<div id="'+lastTile.drawnTile+'" class="tile front tile'+colors[lastTile.drawnTile.substr(2,1)]+'"><img src="tiles/'+lastTile.drawnTile.substr(0,2)+'.png"/></div>';
          t += '</div></div>';
          $("#hand").off("click", "#blank").on("click","#blank",replaceBack);
          $("#hand").append(t)        }
        else {
          t = '<div id="'+hand[i]+'" class="tile tile'+colors[hand[i].substr(2,1)]+'"><img src="tiles/'+hand[i].substr(0,2)+'.png"/></div>';
          t += '</div></div>';
          $("#hand").append(t);
          $("#hand .tile").draggable({
            drag: dragging,
            revert: "invalid"
          });
        }
      }
    }
  };
};

$(document).ready(function() {
  showLoading();
//  $("#loading").dialog({autoOpen: true, modal: true, dialogClass: "no-close"});
  sankalpa = game();
  sankalpa.createBoard();
  init();
});

function showLoading() {
  $("#sankalpa > .cover").show();
  $("#sankalpa > .loading").show();
}

function hideLoading() {
  $("#sankalpa > .cover").hide();
  $("#sankalpa > .loading").hide();
}

function init() {
  $("#errorDialog").dialog({autoOpen: false});
  $("#offlineDialog").dialog({autoOpen: false});
  $("#clock").hide();
  $("#board").addClass("grid");
  $("input[name='pause']").css("opacity",0.35);
  $("input[name='end']").css("opacity",0.35);
  $("input[name='history']").css("opacity",1.0);
  player = aplayer();
  options.audio = true;
  options.handSize = 3;
  options.time = 1800;
  options.helper = false;
    if (items.players) {
      players = items.players;
    }
    if (items.options) {
      options = items.options;
    }
    if (items.premium) {
      premium = items.premium;
    }
    setOptions();
//    items.email = "esoterikgirl@gmail.com";
    if (items.email) {
      console.log("found items.email "+items.email);
      email = items.email;
      player = aplayer();
      player.setEmail(email);
    }
    else {
      interactiveSignIn(function() {
        if (email !== undefined && email !== null) {
          console.log("user is "+email);
          player = aplayer();
          player.setEmail(email);
        }
        else {
          checkPremium();
        }
      });
      return;
    }
    checkPremium();
  });
}

function finalInit() {
  if (player.getEmail()) {
    loadUser(function() {
      initHandlers();
      hideLoading();
    });
  }
  else {
    initHandlers();
    options.audio = true;
    options.handSize = 3;
    options.time = 1800;
    options.helper = false;
    hideLoading();
  }
}

function checkPremium() {
  if (premium) {
    $("#payicon").remove();
    enableUpgrade();
    finalInit();
  }
  else {
    //check store just to be sure
    google.payments.inapp.getPurchases({
      'parameters': {env: "prod"},
      'success': function(response) {
        var licenses = response.response.details;
        var count = licenses.length;
        for (var i = 0; i < count; i++) {
          var license = licenses[i];
          if (license.sku && license.sku == 'premium' && license.state == 'ACTIVE') {
            $("#payicon").remove();
            premium = true;
            enableUpgrade();
            finalInit();
            return;
          }
        }
        enableUpgrade();
        finalInit();
      },
      'failure': function() {
        console.log("failed purchase check");
        enableUpgrade();
        finalInit();
      }
    });

    $("input[name='notYet']").click(function() {
      $("#premium").dialog("close");
    });
  }
}

function setOptions() {
  if (options.audio) {
    $("input[name='audio']").attr("checked","checked");
  }
  else {
    $("input[name='audio']").removeAttr("checked","checked");
  }
  if (options.helper) {
    $("input[name='helper']").attr("checked","checked");
  }
  else {
    $("input[name='helper']").removeAttr("checked","checked");
  }
  $("input[type='radio']").removeAttr("checked");
  $("#hand"+options.handSize).attr("checked","checked");
  $("#time"+options.time).attr("checked","checked");
  $("input[name^='player']").val("");
  var i;
  for (i=0;i<players.length;i++) {
    $("input[name='player']:eq("+i+")").val(players[i]);
  }
}

function grabOptions() {
  options.audio = $("input[name='audio']").is(":checked");
  options.helper = $("input[name='helper']").is(":checked");
  options.handSize = $("input[name='handsize']:checked").val();
  options.time = parseInt($("input[name='time']:checked").val());
  console.log("grabOptions "+options.audio+";"+options.handSize+";"+options.time);
  players = [];
  $("input[name='player']").each(function() {
    var v = $(this).val();
    console.log("grab "+v);
    if (v.trim() !== "") {
      players.push(v);
    }
  });
  chrome.storage.local.set({"options": options, "players": players, "email": email,"player":player});
}

function initHandlers() {
  $("#games").dialog({autoOpen: false, width: 500, height: 500, modal: true});
  $("#gameResult").dialog({autoOpen: false, width: 400, height: 300, modal: true});
  $("#gameboard").dialog({autoOpen: false, width: 520, height: 570, modal: true});
  // $("#board").hover(
  //   function() {
  //     sankalpa.showGrid();
  //   },
  //   function() {
  //     sankalpa.hideGrid();
  //   });
  $("#board").droppable({
    // over: function(event, ui) {
    //   sankalpa.showGrid();
    // },
    // out: function(event, ui) {
    //   sankalpa.hideGrid();
    // },
    drop: function(event, ui) {
      var x = Math.floor(ui.offset.left/64);
      var y = Math.floor(ui.offset.top/64);
      if (x >= 0 && x < 8 && y >= 0 && y < 8) {
        var tile = ui.draggable.attr("id");
        var s = sankalpa.validateAndScorePlay(y,x,tile);
        if (s > 0 && !sankalpa.hasTile("#board",y,x)) {
          if (options.audio)
            goodPlay.play();
          ui.draggable.remove();
          player.removeTile(tile);
          sankalpa.placeTile("#board",y,x,tile);
          //player.drawTile();
          lastTile = {};
          lastTile.drawnTile = sankalpa.popTile();
          lastTile.tile = tile;
          lastTile.row = y;
          lastTile.col = x;
          lastTile.score = s;
          player.getHand().push("-1");
          player.addScore(s);
          player.renderHand();
          $("#hand .tile").draggable("destroy");
        }
        else {
          if (options.audio)
            badPlay.play();
          //replace tile in hand
          player.renderHand();
        }
       }
      else {
        if (options.audio)
          badPlay.play();
        //replace tile in hand
        player.renderHand();
      }
      $("#drophilight").hide();
    },
    accept: function(ui) {
      var x = Math.floor(ui.offset().left/64);
      var y = Math.floor(ui.offset().top/64);
      if (x >= 0 && x < 8 && y >= 0 && y < 8) {
        var tile = ui.attr("id");
        var s = sankalpa.validateAndScorePlay(y,x,tile);
        if (s > 0 && !sankalpa.hasTile("#board",y,x)) {
          return true;
        }
        // else {
        //   if (options.audio)
        //     badPlay.play();
          //replace tile in hand
//          player.renderHand();
        // }
      }
      // else {
      //   if (options.audio)
      //     badPlay.play();
        //replace tile in hand
  //      player.renderHand();
      // }
      $("#drophilight").hide();
      return false;
    }
  });
  $("input[name='play']").click(function() {
    showLoading();
    enablePremium();  //in case of free user, resets options to valid, default states
    grabOptions();
    sankalpa = game();
    sankalpa.createBoard();
    sankalpa.init();
    player.init();
    createGame(function() {
      sankalpa.initBoard("#board");
      hideLoading();
      startGame();
    });
  });
  $("input[name='pause']").click(pauseGame);
  $("input[name='end']").click(endGame);
  $("#helpicon").click(function() {
    $("#help").load("help.html");
    $("#help").dialog("open");
  });
  $("#help").dialog({autoOpen: false, width: 500, height: 400});
  $(".cover").click(function() {
    return false;
  });
  $("#history").click(function() {
    if ($(this).css("opacity") == 1.0) {
      showGames();
    }
  });
  // renderClock(300);
  // renderScore(0);
}

function enableInvites(n) {
  $("input[name^='player']").hide();
  var i;
  if (n == 1) {
    n = 3;
  }
  for (i=1;i<=n;i++) {
    $("input[name='player'"+i+"]").show();
  }
}

function renderScore(sc) {
  var s = $("#score");
  s.empty();
  while (true) {
    scoredigit = sc%10;
    s.prepend('<img src="images/'+scoredigit+'.png"/>');
    sc = Math.floor(sc/10);
    if (sc === 0) {
      break;
    }
  }
}

function startGame() {
  $(window).unbind("keydown").bind("keydown", function(evt) {
    console.log("keydown "+evt.which);
    if (evt.which == 8) {
      if (lastTile !== null) {
        sankalpa.unplaceTile("#board", lastTile.row, lastTile.col, lastTile.tile, lastTile.drawnTile);
      }
    }
  });
  $("input[name='pause']").css("opacity",1.0);
  $("input[name='end']").css("opacity",1.0);
  $("input[name='history']").css("opacity",0.35);
  player.initHand();
  player.renderHand();
  renderScore(0);
  $("#options .cover").show();
  if (options.audio)
    startAudio.play();
  if (options.time > 0) {
    $("#clock").show();
    startClock(options.time, endGame);
  }
  else {
    $("#clock").hide();
  }
  // $("#options").hide();
  // $("#scores .player").remove();
  // $("#scores").show();
  // var i;
  // for (i=0;i<players.length;i++) {
  //   $("#scores").append('<div class="player" id="player'+i+'"><span class="name">'+players[i].getEmail()+'</span><span class="score">'+players[i].getScore()+'</span></div>');
  // }
   
}

function pauseGame() {
  if ($("input[name='pause']").css("opacity") == 1.0) {
    if ($("input[name='pause']").val() == 'Pause') {
      $("input[name='pause']").val("Resume");
      $("#board").css("-webkit-filter","blur(12px)");
      $("#hand").css("-webkit-filter","blur(12px)");
    }
    else {
      resumeGame();
    }
  }
}

function resumeGame() {
  $("input[name='pause']").val("Pause");
  $("#board").css("-webkit-filter","");
  $("#hand").css("-webkit-filter","");
}

function endGame() {
  if ($("input[name='pause']").css("opacity") == 1.0) {
    lastTile = null;
    $("input[name='pause']").css("opacity",0.35);
    $("input[name='end']").css("opacity",0.35);
    $("input[name='history']").css("opacity",1.0);
    var c = sankalpa.getRemainingTilesCount()+player.getHandCount();
    console.log("remaining tiles "+c);
    if (c == 0) player.addScore(256);
    if (c == 1) player.addScore(128);
    if (c == 2) player.addScore(64);
    $(".cover").hide();
    stopClock();
    resumeGame();
    showLoading();
    saveGame(function() {
      $("#board > div[id^='tile']").remove();
      showGames();
    });
  }
}

function showGames() {
  $("#games").dialog("open");
  loadGames('active',$("#gamesWaiting .gamesList"), function() {
    $("#gamesWaiting .gameline").click(function() {
      $("#games").dialog("close");
      // playerWords = [];
      // words = [];
      // score = 0;
      // $("#wordlist").empty().hide();
      // $("#compwordlist").empty().hide();
      loadGame($(this).attr("id"));
    });
  });
  var gameIdx = 0;
  if (gameIdx === 0) {
    loadGames('completed',$("#gamesPlayed .gamesList"), function() {
      hideLoading();
      gameIdx = $("#gamesPlayed .gamesLine").size();
      $("#gamesPlayed .gameline").click(function() {
        gameResult($(this).attr("id"), function(ok, data) {
          if (ok) {
            $("#gameResult").empty().append(data);
            $("#gameResult").dialog("open");
            $("#gameResult .gamescore").each(function() {
              var userid = $(this).attr('id');
              if ($(this).parent().find("."+userid).size() > 0) {
                var board = $(this).parent().find("."+userid).text();
                console.log(userid+";"+board);
                $(this).parent().append("<div class='gameboard'></div>");
                renderBoard('#gameResult .gameboard',board, 24);
//                $("#gameboard").dialog("open");
              }
            });
            $("#gameResult .gamescore").click(function() {
              var userid = $(this).attr('id');
              if ($(this).parent().find("."+userid).size() > 0) {
                var board = $(this).parent().find("."+userid).text();
                console.log(userid+";"+board);
                $("#gameboard").empty();
                renderBoard('#gameboard',board);
                $("#gameboard").dialog("open");
              }
            });
          }
        });
      });
      $("#gamesPlayed .gamesList").waypoint("infinite", {
        items: ".gameline",
        offset: "75%",
        onAfterPageLoad: function() {
          gameIdx = $("#gamesPlayed .gamesLine").size();
        }
      });
    });
  }
  hideLoading();
}

function renderBoard(id,b,tilesize) {
  var ub = game();
  ub.createBoard();
  var t = b.split(";");
  var r,c,i,tile;
  for (r=0;r<8;r++) {
    for (c=0;c<8;c++) {
      i=r*8+c;
      if (t[i] != '-') {
        tile = t[i];
        console.log(tile);
        ub.placeTile(id,r,c,tile,tilesize);
      }
    }
  }
}

function enablePremium() {
  if (!premium) {
    $("input[name='player']").attr("disabled","disabled");
    $("input[name='time']").attr("disabled","disabled");
    $("#time1800").removeAttr("disabled");
    $("#time1800").attr("checked","checked");
  }
  else {
    $("input[name='player']").removeAttr("disabled");
    $("input[name='time']").removeAttr("disabled");
  }
}

function enableUpgrade() {
  enablePremium();
  $("#premium").dialog({autoOpen: false});
  $("#payicon").click(function() {
    $("#premium").dialog("open");
  });
  
  $("#premium input[name='upgrade']").click(function() {
    google.payments.inapp.buy({
      'parameters': {'env': 'prod'},
      'sku': 'premium',
      'success': function(purchase) {
        $("#premium").dialog("close");
        $("upgradeButtons").remove();
        premium = true;
        enablePremium();
        chrome.storage.local.set({'premium': true}, function() {
        });
      },
      'failure': function(purchase) {
        console.log("onPurchaseFailed", purchase);
        var reason = purchase.response.errorType;
        $("#statusDiv").empty.append("Purchase failed. " + reason);
      }
    });
  });
}
