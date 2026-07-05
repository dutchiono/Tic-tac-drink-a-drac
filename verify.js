// Exhaustive verification of the AI's flawlessness.
// Mirrors the minimax logic in index.html, then plays out EVERY possible
// sequence of human moves against the AI and asserts the AI never loses,
// and that no illegal board state ever occurs.

var HUMAN = "X", AI = "O";
var LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function getWinner(b) {
  for (var i = 0; i < LINES.length; i++) {
    var a = LINES[i][0], c = LINES[i][1], d = LINES[i][2];
    if (b[a] !== "" && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}
function isFull(b){ return b.every(function(x){ return x !== ""; }); }

function minimax(b, depth, isMax) {
  var w = getWinner(b);
  if (w) return w === AI ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;
  var i, score;
  if (isMax) {
    var best = -Infinity;
    for (i=0;i<9;i++) if (b[i]===""){ b[i]=AI; score=minimax(b,depth+1,false); b[i]=""; if(score>best)best=score; }
    return best;
  } else {
    var worst = Infinity;
    for (i=0;i<9;i++) if (b[i]===""){ b[i]=HUMAN; score=minimax(b,depth+1,true); b[i]=""; if(score<worst)worst=score; }
    return worst;
  }
}
function bestMove(b) {
  var bestScore=-Infinity, move=-1;
  for (var i=0;i<9;i++) if (b[i]===""){ b[i]=AI; var s=minimax(b,0,false); b[i]=""; if(s>bestScore){bestScore=s;move=i;} }
  return move;
}

var stats = { games: 0, aiWins: 0, draws: 0, humanWins: 0 };
var illegal = 0;

function assertLegal(b) {
  var x = b.filter(function(c){return c===HUMAN;}).length;
  var o = b.filter(function(c){return c===AI;}).length;
  // Human moves first; counts must satisfy x === o or x === o+1.
  if (!(x === o || x === o + 1)) illegal++;
  // Two winners can never coexist.
  var winnersX = false, winnersO = false;
  for (var i=0;i<LINES.length;i++){
    var a=LINES[i][0],c=LINES[i][1],d=LINES[i][2];
    if (b[a]!==""&&b[a]===b[c]&&b[a]===b[d]){ if(b[a]===HUMAN)winnersX=true; else winnersO=true; }
  }
  if (winnersX && winnersO) illegal++;
}

// Recursively explore every human decision. Human moves, then AI responds
// deterministically. Human is the "adversary" trying every option.
function explore(b) {
  assertLegal(b);
  var w = getWinner(b);
  if (w) {
    stats.games++;
    if (w === AI) stats.aiWins++;
    else stats.humanWins++; // <-- must remain 0
    return;
  }
  if (isFull(b)) { stats.games++; stats.draws++; return; }

  // Human's turn: try EVERY empty square.
  for (var i = 0; i < 9; i++) {
    if (b[i] !== "") continue;
    var nb = b.slice();
    nb[i] = HUMAN;
    assertLegal(nb);

    var aw = getWinner(nb);
    if (aw === HUMAN) { stats.games++; stats.humanWins++; continue; }
    if (isFull(nb)) { stats.games++; stats.draws++; continue; }

    // AI responds optimally.
    var m = bestMove(nb);
    if (m === -1 || nb[m] !== "") { illegal++; continue; }
    nb[m] = AI;

    explore(nb);
  }
}

explore(["","","","","","","","",""]);

console.log("Terminal game states explored:", stats.games);
console.log("  AI wins:    ", stats.aiWins);
console.log("  Draws:      ", stats.draws);
console.log("  Human wins: ", stats.humanWins);
console.log("Illegal states detected:", illegal);

if (stats.humanWins === 0 && illegal === 0) {
  console.log("\nPASS: The AI is unbeatable and no illegal state ever occurs.");
  process.exit(0);
} else {
  console.log("\nFAIL: flawlessness violated.");
  process.exit(1);
}
